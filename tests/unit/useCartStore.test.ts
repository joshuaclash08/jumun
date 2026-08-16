import { describe, expect, it, beforeEach } from "vitest";
import { useCartStore } from "@/store/useCartStore";
import type { CartItem, StoreInfo } from "@/lib/types";

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  const mockStoreInfo: StoreInfo = {
    storeId: "store-001",
    storeName: "카페 주문",
    orderType: "dine-in",
    table: "5",
  };

  const sampleItem: CartItem = {
    id: "item-1",
    productId: "coffee-americano",
    quantity: 1,
    selections: [],
    unitPrice: 4500,
  };

  it("sets and retrieves store info", () => {
    useCartStore.getState().setStoreInfo(mockStoreInfo);
    expect(useCartStore.getState().storeInfo).toEqual(mockStoreInfo);
  });

  it("adds items and records toast and history", () => {
    useCartStore.getState().addItem(sampleItem);
    const state = useCartStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(sampleItem);
    expect(state.history).toHaveLength(1);
    expect(state.toasts.length).toBeGreaterThan(0);
  });

  it("updates item quantity correctly", () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().updateQuantity("item-1", 2);

    expect(useCartStore.getState().items[0].quantity).toBe(3);

    useCartStore.getState().updateQuantity("item-1", -3);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes items and creates undoable action", () => {
    useCartStore.getState().addItem(sampleItem);
    useCartStore.getState().removeItem("item-1");

    expect(useCartStore.getState().items).toHaveLength(0);

    // Call onUndo from the latest toast
    const latestToast = useCartStore.getState().toasts.at(-1);
    expect(latestToast?.onUndo).toBeDefined();
    latestToast?.onUndo?.();

    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("handles 5-deep undo history stack correctly", () => {
    for (let i = 1; i <= 7; i++) {
      useCartStore.getState().addItem({
        ...sampleItem,
        id: `item-${i}`,
      });
    }

    // Maximum history length is capped at 5
    expect(useCartStore.getState().history.length).toBeLessThanOrEqual(5);

    // Undo action reverts to previous state
    const countBefore = useCartStore.getState().items.length;
    useCartStore.getState().undoLastAction();
    expect(useCartStore.getState().items.length).toBe(countBefore - 1);
  });

  it("clears cart and dismisses toasts", () => {
    useCartStore.getState().addItem(sampleItem);
    const toastId = useCartStore.getState().toasts[0].id;

    useCartStore.getState().dismissToast(toastId);
    expect(
      useCartStore.getState().toasts.find((t) => t.id === toastId)
    ).toBeUndefined();

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().orderStatus).toBe("idle");
  });
});
