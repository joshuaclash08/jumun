import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ProductCard } from "@/components/flow/ProductCard";
import { FeaturedMenuSection } from "@/components/flow/FeaturedMenuSection";
import { CartDrawer } from "@/components/flow/CartDrawer";
import { ConfirmationStep } from "@/components/flow/ConfirmationStep";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { StaffCallButton } from "@/components/flow/StaffCallButton";
import { ProductDetailSheet } from "@/components/flow/ProductDetailSheet";
import { OrderTypeSelectView } from "@/components/flow/OrderTypeSelectView";
import { TableSelectView } from "@/components/flow/TableSelectView";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { FontScaleSelector } from "@/components/settings/FontScaleSelector";
import { useCartStore } from "@/store/useCartStore";
import type { Product, CartItem, OrderReceipt, StoreListing } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/order/jumun-cafe-01",
}));

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

    expect(screen.getByText("인기 메뉴")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    const itemButton = screen.getByRole("button", {
      name: /아메리카노, 4,500원, 인기 1위 메뉴/i,
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
        orderType: "dine-in",
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

  it("renders HeaderBar with back button, settings link, dine-in table badge, and passes axe check", async () => {
    const { container } = render(
      <HeaderBar
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "dine-in",
          table: "3",
        }}
      />
    );

    const backLink = screen.getByRole("link", { name: "뒤로 이동" });
    expect(backLink).toBeInTheDocument();
    // Dine-in back goes to the table picker, not the order-type picker --
    // see components/layout/HeaderBar.tsx's backHref comment.
    expect(backLink).toHaveAttribute("href", "/order/jumun-cafe-01/table");
    expect(screen.getByRole("link", { name: "설정 열기" })).toBeInTheDocument();
    expect(screen.getByText("주문 카페 1호점")).toBeInTheDocument();
    expect(screen.getByText("3번 테이블")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders HeaderBar in takeout mode with takeout badge and passes axe check", async () => {
    const { container } = render(
      <HeaderBar
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "takeout",
        }}
      />
    );

    const backLink = screen.getByRole("link", { name: "뒤로 이동" });
    expect(backLink).toHaveAttribute("href", "/order/jumun-cafe-01");
    expect(screen.getByRole("link", { name: "설정 열기" })).toBeInTheDocument();
    expect(screen.getByText("주문 카페 1호점")).toBeInTheDocument();
    expect(screen.getByText("포장")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders StaffCallButton with accessible trigger and handles call flow", async () => {
    render(
      <StaffCallButton
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "dine-in",
          table: "3",
        }}
      />
    );

    const callButton = screen.getByRole("button", { name: "직원 호출하기" });
    expect(callButton).toBeInTheDocument();

    // Open staff call drawer
    fireEvent.click(callButton);

    // Initial idle state in drawer
    expect(screen.getByText("직원을 호출할까요?")).toBeInTheDocument();
    expect(screen.getByText("3번 테이블")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "호출하기" })).toBeInTheDocument();

    // Confirm call
    fireEvent.click(screen.getByRole("button", { name: "호출하기" }));

    // Success state in drawer
    expect(await screen.findByText("호출이 완료되었어요!")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("renders StaffCallButton with text label when isExpanded is true and compact icon when false", async () => {
    const { rerender } = render(
      <StaffCallButton
        isExpanded={true}
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "dine-in",
          table: "3",
        }}
      />
    );

    expect(screen.getByText("직원 호출")).toBeInTheDocument();

    rerender(
      <StaffCallButton
        isExpanded={false}
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "dine-in",
          table: "3",
        }}
      />
    );

    expect(screen.getByText("직원 호출").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "직원 호출하기" })).toBeInTheDocument();
  });

  it("renders ProductDetailSheet with overlaid back button, required badge, and no '추가금 없음' text", () => {
    render(
      <ProductDetailSheet
        product={sampleProduct}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Overlaid back button
    expect(screen.getByRole("button", { name: "메뉴 상세 닫기" })).toBeInTheDocument();

    // Required badge next to option title
    expect(screen.getByText("온도")).toBeInTheDocument();
    expect(screen.getByText("필수")).toBeInTheDocument();

    // No '(1개 선택)' helper text
    expect(screen.queryByText("(1개 선택)")).not.toBeInTheDocument();

    // No '추가금 없음' text
    expect(screen.queryByText("추가금 없음")).not.toBeInTheDocument();

    // Price delta is rendered for > 0 options
    expect(screen.getByText("+500원")).toBeInTheDocument();
  });

  it("handles option group max selections with toast alert", () => {
    const multiOptionProduct: Product = {
      ...sampleProduct,
      optionGroups: [
        {
          id: "syrup",
          labelKo: "시럽",
          required: false,
          selectionType: "multiple",
          maxSelections: 1,
          options: [
            { id: "vanilla", labelKo: "바닐라", priceDelta: 500 },
            { id: "caramel", labelKo: "카라멜", priceDelta: 500 },
          ],
        },
      ],
    };

    render(
      <ProductDetailSheet
        product={multiOptionProduct}
        open={true}
        onOpenChange={() => {}}
      />
    );

    const vanillaBtn = screen.getByRole("button", { name: /바닐라/ });
    const caramelBtn = screen.getByRole("button", { name: /카라멜/ });

    // Select first option
    fireEvent.click(vanillaBtn);
    expect(vanillaBtn).toHaveAttribute("aria-pressed", "true");

    // Attempt to select second option exceeding maxSelections (1)
    fireEvent.click(caramelBtn);
    expect(caramelBtn).toHaveAttribute("aria-pressed", "false");

    const toasts = useCartStore.getState().toasts;
    expect(toasts.some((t) => t.messageKo.includes("최대 1개"))).toBe(true);
  });

  it("renders OrderTypeSelectView with standard back button and settings button", () => {
    const sampleStore: StoreListing = {
      storeId: "jumun-cafe-01",
      storeName: "주문 카페 1호점",
      branchKo: "강남본점",
      addressKo: "서울 강남구 역삼로 123",
      tableCount: 8,
      distanceKo: "50m",
    };

    render(<OrderTypeSelectView store={sampleStore} />);

    const backLink = screen.getByRole("link", { name: "홈으로 이동" });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/");

    const settingsLink = screen.getByRole("link", { name: "설정 열기" });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("renders TableSelectView with standard back button and settings button", () => {
    const sampleStore: StoreListing = {
      storeId: "jumun-cafe-01",
      storeName: "주문 카페 1호점",
      branchKo: "강남본점",
      addressKo: "서울 강남구 역삼로 123",
      tableCount: 8,
      distanceKo: "50m",
    };

    render(<TableSelectView store={sampleStore} />);

    const backLink = screen.getByRole("link", { name: "이전 화면으로 돌아가기" });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/order/jumun-cafe-01");

    const settingsLink = screen.getByRole("link", { name: "설정 열기" });
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("renders standalone BackButton with link and custom click handler", () => {
    const onClick = vi.fn();
    render(<BackButton href="/custom-url" label="이전으로" onClick={onClick} />);

    const link = screen.getByRole("link", { name: "이전으로" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/custom-url");

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders standalone SettingsIconButton with link to /settings", () => {
    render(<SettingsIconButton />);
    const link = screen.getByRole("link", { name: "설정 열기" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/settings");
  });

  it("renders QuantityStepper and fires increment/decrement handlers", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();

    render(
      <QuantityStepper
        value={3}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        min={1}
        max={10}
        itemLabel="아메리카노"
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();

    const incBtn = screen.getByRole("button", { name: "아메리카노 수량 1개 늘리기" });
    const decBtn = screen.getByRole("button", { name: "아메리카노 수량 1개 줄이기" });

    fireEvent.click(incBtn);
    expect(onIncrement).toHaveBeenCalledTimes(1);

    fireEvent.click(decBtn);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });

  it("renders FontScaleSelector with radio options", () => {
    render(<FontScaleSelector />);
    const group = screen.getByRole("radiogroup", { name: "글자 크기 선택" });
    expect(group).toBeInTheDocument();
    expect(screen.getByText("보통")).toBeInTheDocument();
    expect(screen.getByText("크게")).toBeInTheDocument();
    expect(screen.getByText("아주 크게")).toBeInTheDocument();
  });
});


