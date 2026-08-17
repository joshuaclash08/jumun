"use client";

import { create } from "zustand";
import type { CartItem, OrderReceipt, OrderStatus, StoreInfo, ToastItem } from "@/lib/types";
import { notify } from "@/lib/services/A11yFeedbackService";
import { useAccessibilityStore } from "./useAccessibilityStore";

interface CartStore {
  storeInfo: StoreInfo | null;
  items: CartItem[];
  orderStatus: OrderStatus;
  lastReceipt: OrderReceipt | null;
  toasts: ToastItem[];
  history: CartItem[][];

  setStoreInfo: (storeInfo: StoreInfo) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  resetOrder: () => void;
  setOrderStatus: (status: OrderStatus) => void;
  setLastReceipt: (receipt: OrderReceipt | null) => void;
  dismissToast: (toastId: string) => void;
  showToast: (kind: "success" | "error", messageKo: string) => void;
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
  toasts: [],
  history: [],

  setStoreInfo: (storeInfo) => set({ storeInfo }),

  addItem: (item) => {
    const { items, history, toasts } = get();
    const toast = notify("success", `${item.quantity}개가 장바구니에 담겼습니다.`, {
      hapticsEnabled: hapticsEnabled(),
    });
    set({ items: [...items, item], history: pushHistory(history, items), toasts: [...toasts, toast] });
  },

  removeItem: (itemId) => {
    const { items, history, toasts } = get();
    const removedIndex = items.findIndex((item) => item.id === itemId);
    if (removedIndex === -1) return;
    const removed = items[removedIndex];
    const nextItems = items.filter((item) => item.id !== itemId);
    const toast = notify("success", "장바구니에서 삭제되었습니다.", {
      hapticsEnabled: hapticsEnabled(),
      onUndo: () => {
        const current = get().items;
        set({
          items: [
            ...current.slice(0, removedIndex),
            removed,
            ...current.slice(removedIndex),
          ],
        });
      },
    });
    set({ items: nextItems, history: pushHistory(history, items), toasts: [...toasts, toast] });
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

  dismissToast: (toastId) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== toastId) })),

  showToast: (kind, messageKo) => {
    const toast = notify(kind, messageKo, {
      hapticsEnabled: hapticsEnabled(),
    });
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },

  undoLastAction: () => {
    const { history } = get();
    const previous = history.at(-1);
    if (!previous) return;
    set({ items: previous, history: history.slice(0, -1) });
  },
}));
