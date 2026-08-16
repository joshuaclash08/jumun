import { describe, expect, it } from "vitest";
import { OrderService } from "@/lib/services";
import type { CartItem, StoreInfo } from "@/lib/types";

describe("OrderService", () => {
  const mockStore: StoreInfo = {
    storeId: "store-test",
    storeName: "주문 테스트 카페",
    orderType: "dine-in",
    table: "3",
  };

  const mockItems: CartItem[] = [
    {
      id: "item-1",
      productId: "americano",
      quantity: 2,
      selections: [],
      unitPrice: 4500,
    },
    {
      id: "item-2",
      productId: "latte",
      quantity: 1,
      selections: [],
      unitPrice: 5000,
    },
  ];

  it("successfully places an order with correct subtotal and order number", async () => {
    const receipt = await OrderService.submitOrder(
      mockStore,
      mockItems,
      { forceFailure: false }
    );

    expect(receipt).toBeDefined();
    expect(receipt.orderNumber).toMatch(/^\d{3}$/);
    expect(receipt.subtotal).toBe(14000);
    expect(receipt.total).toBe(14000);
    expect(receipt.orderType).toBe("dine-in");
    expect(receipt.store).toEqual(mockStore);
    expect(receipt.items).toEqual(mockItems);
  });

  it("throws an error deterministically when forceFailure is true", async () => {
    await expect(
      OrderService.submitOrder(mockStore, mockItems, {
        forceFailure: true,
      })
    ).rejects.toThrow("결제를 완료하지 못했어요.");
  });
});
