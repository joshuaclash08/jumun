import { describe, expect, it } from "vitest";
import { OrderService, MenuService } from "@/lib/services";
import type { CartItem, StoreInfo, Product } from "@/lib/types";

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

describe("MenuService.validateRequiredOptions", () => {
  const productWithOptions: Product = {
    id: "p1",
    category: "coffee",
    nameKo: "아메리카노",
    descriptionKo: "진한 에스프레소",
    voiceDescriptionKo: "아메리카노",
    price: 4500,
    imageUrl: "/img.jpg",
    available: true,
    optionGroups: [
      {
        id: "temp",
        labelKo: "온도",
        required: true,
        selectionType: "single",
        options: [
          { id: "hot", labelKo: "HOT", priceDelta: 0 },
          { id: "ice", labelKo: "ICE", priceDelta: 500 },
        ],
      },
      {
        id: "shot",
        labelKo: "샷 추가",
        required: false,
        selectionType: "multiple",
        options: [
          { id: "extra", labelKo: "1샷 추가", priceDelta: 500 },
        ],
      },
    ],
  };

  it("returns isValid: true when all required groups are selected", () => {
    const res = MenuService.validateRequiredOptions(productWithOptions, {
      temp: ["ice"],
    });
    expect(res.isValid).toBe(true);
    expect(res.missingGroups).toHaveLength(0);
  });

  it("returns isValid: false with missingGroup name when required option is missing", () => {
    const res = MenuService.validateRequiredOptions(productWithOptions, {
      shot: ["extra"],
    });
    expect(res.isValid).toBe(false);
    expect(res.missingGroups).toContain("온도");
  });

  it("returns isValid: true when product has no option groups", () => {
    const plainProduct: Product = {
      id: "p2",
      category: "coffee",
      nameKo: "에스프레소",
      descriptionKo: "진한 에스프레소 원액",
      voiceDescriptionKo: "에스프레소",
      price: 4000,
      imageUrl: "/img.jpg",
      available: true,
      optionGroups: [],
    };
    const res = MenuService.validateRequiredOptions(plainProduct, {});
    expect(res.isValid).toBe(true);
    expect(res.missingGroups).toHaveLength(0);
  });

  it("resolves localized missing group names in English when language is 'en'", () => {
    const productWithI18nGroup: Product = {
      ...productWithOptions,
      optionGroups: [
        {
          id: "temp",
          title: "온도",
          labelKo: "온도",
          titleI18n: { languages: { "en-US": "Temperature" } },
          required: true,
          selectionType: "single",
          options: [
            { id: "hot", labelKo: "HOT", priceDelta: 0 },
            { id: "ice", labelKo: "ICE", priceDelta: 500 },
          ],
        },
      ],
    };
    const res = MenuService.validateRequiredOptions(productWithI18nGroup, {}, "en");
    expect(res.isValid).toBe(false);
    expect(res.missingGroups).toContain("Temperature");
  });
});
