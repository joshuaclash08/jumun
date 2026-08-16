import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProductCard } from "@/components/flow/ProductCard";
import { FeaturedMenuSection } from "@/components/flow/FeaturedMenuSection";
import { CartDrawer } from "@/components/flow/CartDrawer";
import { ConfirmationStep } from "@/components/flow/ConfirmationStep";
import { useCartStore } from "@/store/useCartStore";
import type { Product, CartItem, OrderReceipt } from "@/lib/types";

describe("Component Accessibility & Rendering", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  const sampleProduct: Product = {
    id: "prod-americano",
    category: "coffee",
    nameKo: "아메리카노",
    descriptionKo: "깊고 풍부한 바디감의 에스프레소에 물을 더한 클래식 커피",
    voiceDescriptionKo: "아메리카노, 4500원, 깊고 풍부한 바디감의 클래식 커피",
    price: 4500,
    imageUrl: "/images/menu/americano.jpg",
    available: true,
    optionGroups: [
      {
        id: "temp",
        labelKo: "온도",
        required: true,
        selectionType: "single",
        options: [
          { id: "hot", labelKo: "따뜻하게 (HOT)", priceDelta: 0 },
          { id: "ice", labelKo: "시원하게 (ICE)", priceDelta: 500 },
        ],
      },
    ],
  };

  const sampleCartItem: CartItem = {
    id: "cart-item-1",
    productId: "prod-americano",
    nameKo: "아메리카노",
    optionsSummary: "따뜻하게 (HOT)",
    quantity: 2,
    selections: [],
    unitPrice: 4500,
  };

  it("renders ProductCard with concise accessible label and price", () => {
    render(<ProductCard product={sampleProduct} onClick={() => {}} />);
    const cardButton = screen.getByRole("button", {
      name: "아메리카노, 4,500원",
    });
    expect(cardButton).toBeInTheDocument();
    expect(screen.getByText("아메리카노")).toBeInTheDocument();
    expect(screen.getByText("4,500원")).toBeInTheDocument();
  });

  it("ensures ProductCard has no accessibility violations with axe", async () => {
    const { container } = render(
      <ProductCard product={sampleProduct} onClick={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders FeaturedMenuSection with top recommended items and responds to clicks", () => {
    let clickedProduct: Product | null = null;
    render(
      <FeaturedMenuSection
        products={[sampleProduct]}
        onProductClick={(p) => {
          clickedProduct = p;
        }}
      />
    );

    expect(screen.getByText("BEST")).toBeInTheDocument();

    const itemButton = screen.getByRole("button", {
      name: /아메리카노, 4,500원, 추천 메뉴/i,
    });
    fireEvent.click(itemButton);
    expect(clickedProduct).toEqual(sampleProduct);
  });

  it("renders sold-out state when product is unavailable", () => {
    const soldOutProduct = { ...sampleProduct, available: false };
    render(<ProductCard product={soldOutProduct} onClick={() => {}} />);
    const cardButton = screen.getByRole("button");
    expect(cardButton).toBeDisabled();
    expect(screen.getByText("품절")).toBeInTheDocument();
  });

  it("renders CartDrawer with real product names and option summaries", () => {
    useCartStore.getState().addItem(sampleCartItem);

    render(
      <CartDrawer open={true} onOpenChange={() => {}} onCheckout={() => {}} />
    );

    expect(screen.getByText("아메리카노")).toBeInTheDocument();
    expect(screen.getByText("따뜻하게 (HOT)")).toBeInTheDocument();
    expect(screen.getByText("9,000원 주문하기")).toBeInTheDocument();
  });

  it("renders ConfirmationStep with itemized receipt details", () => {
    const mockReceipt: OrderReceipt = {
      orderNumber: "742",
      items: [sampleCartItem],
      subtotal: 9000,
      total: 9000,
      orderType: "dine-in",
      store: {
        storeId: "jumun-cafe-01",
        storeName: "주문 카페 1호점",
        table: "3",
      },
      placedAt: new Date().toISOString(),
    };

    useCartStore.getState().setLastReceipt(mockReceipt);

    render(<ConfirmationStep onReset={() => {}} />);

    expect(screen.getByText("주문이 완료되었어요!")).toBeInTheDocument();
    expect(screen.getByText("742")).toBeInTheDocument();
    expect(screen.getByText("매장 식사")).toBeInTheDocument();
    expect(screen.getAllByText("9,000원").length).toBeGreaterThanOrEqual(1);
  });
});
