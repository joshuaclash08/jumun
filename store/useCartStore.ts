"use client";

import { create } from "zustand";
import type { CartItem, OrderReceipt, OrderStatus, StoreInfo } from "@/lib/types";
import { toast } from "@/lib/services/A11yFeedbackService";
import { useAccessibilityStore } from "./useAccessibilityStore";

interface CartStore {
  storeInfo: StoreInfo | null;
  items: CartItem[];
  orderStatus: OrderStatus;
  lastReceipt: OrderReceipt | null;
  history: CartItem[][];

  setStoreInfo: (storeInfo: StoreInfo) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  resetOrder: () => void;
  setOrderStatus: (status: OrderStatus) => void;
  setLastReceipt: (receipt: OrderReceipt | null) => void;
  undoLastAction: () => void;
}

const MAX_HISTORY = 5;

function pushHistory(history: CartItem[][], items: CartItem[]): CartItem[][] {
  return [...history, items].slice(-MAX_HISTORY);
}

function hapticsEnabled(): boolean {
  return useAccessibilityStore.getState().hapticsEnabled;
}

// A11yFeedbackService is imported statically, not dynamically, unlike legacy's
// equivalent -- legacy's version needed a dynamic import() to dodge a real
// circular dependency (see docs/architecture.md), but this A11yFeedbackService
// never imports from this store, so no cycle exists here to work around.
export const useCartStore = create<CartStore>()((set, get) => ({
  storeInfo: null,
  items: [],
  orderStatus: "idle",
  lastReceipt: null,
  history: [],

  setStoreInfo: (storeInfo) => set({ storeInfo }),

  addItem: (item) => {
    const { items, history } = get();
    toast({
      kind: "success",
      messageKo: `${item.nameKo || "상품"} ${item.quantity}잔이 장바구니에 담겼습니다.`,
      variant: "cart",
      hapticsEnabled: hapticsEnabled(),
    });
    set({ items: [...items, item], history: pushHistory(history, items) });
  },

  removeItem: (itemId) => {
    const { items, history } = get();
    const removedIndex = items.findIndex((item) => item.id === itemId);
    if (removedIndex === -1) return;
    const removed = items[removedIndex];
    const nextItems = items.filter((item) => item.id !== itemId);
    toast({
      kind: "success",
      messageKo: `${removed.nameKo || "상품"}가 장바구니에서 삭제되었습니다.`,
      variant: "delete",
      hapticsEnabled: hapticsEnabled(),
      onUndo: () => {
        const current = get().items;
        set({
          items: [
            ...current.slice(0, removedIndex),
            removed,
            ...current.slice(removedIndex),
          ],
          history: pushHistory(get().history, current),
        });
      },
    });
    set({ items: nextItems, history: pushHistory(history, items) });
  },

  updateQuantity: (itemId, delta) => {
    const { items, history } = get();
    const current = items.find((item) => item.id === itemId);
    if (!current) return;

    const nextQuantity = current.quantity + delta;
    if (nextQuantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    const nextItems = items.map((item) =>
      item.id === itemId ? { ...item, quantity: nextQuantity } : item,
    );
    set({ items: nextItems, history: pushHistory(history, items) });
  },

  clearCart: () => set({ items: [] }),

  resetOrder: () => set({ items: [], orderStatus: "idle", lastReceipt: null, storeInfo: null }),

  setOrderStatus: (orderStatus) => set({ orderStatus }),

  setLastReceipt: (lastReceipt) => set({ lastReceipt }),

  undoLastAction: () => {
    const { history } = get();
    const previous = history.at(-1);
    if (!previous) return;
    set({ items: previous, history: history.slice(0, -1) });
  },
}));
