import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import { WizardOrderView } from "@/components/flow/WizardOrderView";
import { MenuClientView } from "@/components/flow/MenuClientView";
import { OneHandedContainer } from "@/components/layout/OneHandedContainer";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useCartStore } from "@/store/useCartStore";
import type { MenuCategory, Product, StoreInfo } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/order/jumun-cafe-01",
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...domProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...domProps} alt={domProps.alt || ""} />;
  },
}));

describe("WizardOrderView & One-Handed Layout", () => {
  const mockCategories: MenuCategory[] = [
    { id: "coffee", labelKo: "커피" },
    { id: "beverage", labelKo: "논커피" },
  ];

  const mockProducts: Product[] = [
    {
      id: "prod-americano",
      category: "coffee",
      nameKo: "아메리카노",
      descriptionKo: "깊고 풍부한 바디감의 클래식 커피",
      voiceDescriptionKo: "아메리카노, 4,500원",
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
    },
    {
      id: "prod-latte",
      category: "coffee",
      nameKo: "카페라떼",
      descriptionKo: "부드러운 우유와 에스프레소의 조화",
      voiceDescriptionKo: "카페라떼, 5,000원",
      price: 5000,
      imageUrl: "/images/menu/latte.jpg",
      available: true,
      optionGroups: [],
    },
    {
      id: "prod-tea",
      category: "beverage",
      nameKo: "제주 녹차",
      descriptionKo: "유기농 녹차",
      voiceDescriptionKo: "제주 녹차, 5,500원",
      price: 5500,
      imageUrl: "/images/menu/tea.jpg",
      available: true,
      optionGroups: [
        {
          id: "topping",
          labelKo: "토핑",
          required: false,
          selectionType: "multiple",
          maxSelections: 1,
          options: [
            { id: "honey", labelKo: "꿀 추가", priceDelta: 300 },
            { id: "lemon", labelKo: "레몬 추가", priceDelta: 300 },
          ],
        },
      ],
    },
  ];

  const mockStoreInfo: StoreInfo = {
    storeId: "jumun-cafe-01",
    storeName: "주문 카페 강남점",
    table: "3",
    orderType: "dine-in",
  };

  beforeEach(() => {
    useCartStore.getState().resetOrder();
    useAccessibilityStore.getState().resetAll();
  });

  it("updates oneHandedMode and voiceGuideEnabled in accessibility store", () => {
    const store = useAccessibilityStore.getState();
    expect(store.oneHandedMode).toBe("none");
    expect(store.voiceGuideEnabled).toBe(false);

    store.setOneHandedMode("left");
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("left");

    store.setOneHandedMode("right");
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("right");

    store.setVoiceGuideEnabled(true);
    expect(useAccessibilityStore.getState().voiceGuideEnabled).toBe(true);
  });

  it("renders audio controls and exit button in top bar", () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "일반 메뉴판으로 나가기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /음성 안내/i })).toBeInTheDocument();
  });

  it("applies one-handed layout classes properly for left, right, and none modes", () => {
    // 1. None mode
    useAccessibilityStore.getState().setOneHandedMode("none");
    const { container, rerender } = render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );
    expect(container.querySelector(".mx-auto")).toBeInTheDocument();

    // 2. Left mode
    useAccessibilityStore.getState().setOneHandedMode("left");
    rerender(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );
    expect(container.querySelector(".mr-auto.self-start")).toBeInTheDocument();

    // 3. Right mode
    useAccessibilityStore.getState().setOneHandedMode("right");
    rerender(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );
    expect(container.querySelector(".ml-auto.self-end")).toBeInTheDocument();
  });

  it("completes full 4-step wizard flow: Category -> Product -> Option -> Payment", async () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    // Step 1: Category selection
    expect(screen.getByText("어떤 메뉴를 드실까요?")).toBeInTheDocument();
    const coffeeCategoryBtn = screen.getByRole("button", { name: /^커피/ });
    fireEvent.click(coffeeCategoryBtn);

    // Step 2: Product selection
    expect(screen.getByText("커피 메뉴 선택")).toBeInTheDocument();
    const americanoBtn = screen.getByRole("button", { name: /아메리카노/i });
    fireEvent.click(americanoBtn);

    // Step 3: Option selection (accessible radio buttons)
    expect(screen.getByRole("radio", { name: /따뜻하게 \(HOT\)/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /시원하게 \(ICE\)/i })).toBeInTheDocument();

    // Select ICE option
    const iceOptionBtn = screen.getByRole("radio", { name: /시원하게 \(ICE\)/i });
    fireEvent.click(iceOptionBtn);

    // Quantity Stepper: increase quantity by 1
    const incBtn = screen.getByRole("button", { name: /수량 1개 늘리기/i });
    fireEvent.click(incBtn);
    const decBtn = screen.getByRole("button", { name: /수량 1개 줄이기/i });
    fireEvent.click(decBtn);

    // Click direct checkout
    const checkoutBtn = screen.getByRole("button", { name: /이 메뉴 바로 결제하기/i });
    fireEvent.click(checkoutBtn);

    // Step 4: Checkout summary & synchronized payment method
    expect(screen.getByText("주문 및 결제 확인")).toBeInTheDocument();
    expect(screen.getByText("총 5,000원 결제하기")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /신용\/체크카드/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /토스페이/i })).toBeInTheDocument();
  });

  it("supports adding item to cart and returning to step 1 for multi-item ordering", () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    // Step 1: Select coffee
    fireEvent.click(screen.getByRole("button", { name: /^커피/ }));

    // Step 2: Select latte
    fireEvent.click(screen.getByRole("button", { name: /카페라떼/i }));

    // Step 3: Click "담고 다른 메뉴 더 고르기"
    const addMoreBtn = screen.getByRole("button", { name: /담고 다른 메뉴 더 고르기/i });
    fireEvent.click(addMoreBtn);

    // Should return to Step 1
    expect(screen.getByText("어떤 메뉴를 드실까요?")).toBeInTheDocument();
    // Cart should contain 1 item
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].nameKo).toBe("카페라떼");
  });

  it("does not duplicate items in cart when navigating back from step 4 to step 3", () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    // Select coffee -> Americano
    fireEvent.click(screen.getByRole("button", { name: /^커피/ }));
    fireEvent.click(screen.getByRole("button", { name: /아메리카노/i }));

    // Step 3: Click direct checkout
    fireEvent.click(screen.getByRole("button", { name: /이 메뉴 바로 결제하기/i }));
    expect(screen.getByText("주문 및 결제 확인")).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);

    // Navigate back to Step 3
    const backBtn = screen.getByRole("button", { name: /이전 화면으로 돌아가기/ });
    fireEvent.click(backBtn);
    expect(screen.getByRole("radio", { name: /따뜻하게/i })).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);

    // Click direct checkout again
    fireEvent.click(screen.getByRole("button", { name: /이 메뉴 바로 결제하기/i }));
    expect(screen.getByText("주문 및 결제 확인")).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(screen.getByText("총 4,500원 결제하기")).toBeInTheDocument();
  });

  it("enforces maxSelections limit on multiple options in wizard mode", () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    // Select beverage -> Jeju Tea
    fireEvent.click(screen.getByRole("button", { name: /^논커피/ }));
    fireEvent.click(screen.getByRole("button", { name: /제주 녹차/i }));

    // Step 3: Select Honey (maxSelections = 1)
    const honeyCheckbox = screen.getByRole("checkbox", { name: /꿀 추가/i });
    fireEvent.click(honeyCheckbox);
    expect(honeyCheckbox).toHaveAttribute("aria-checked", "true");

    // Try selecting Lemon -> should be blocked by maxSelections limit
    const lemonCheckbox = screen.getByRole("checkbox", { name: /레몬 추가/i });
    fireEvent.click(lemonCheckbox);
    expect(lemonCheckbox).toHaveAttribute("aria-checked", "false");
  });

  it("passes axe accessibility checks on WizardOrderView", async () => {
    const { container } = render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("does not render promotional wizard banner in standard menu, and renders WizardOrderView when orderMode is wizard", async () => {
    // 1. In standard mode (default): no popup/banner
    useAccessibilityStore.getState().setOrderMode("standard");
    const { rerender } = render(
      <MenuClientView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /단계별 간편 주문/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^커피/ })).toBeInTheDocument();

    // 2. When orderMode is wizard (set via Settings)
    useAccessibilityStore.getState().setOrderMode("wizard");
    rerender(
      <MenuClientView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
      />,
    );

    // Wizard mode should render
    await waitFor(() => {
      expect(screen.getByText("어떤 메뉴를 드실까요?")).toBeInTheDocument();
    });

    // 3. Clicking "일반 메뉴판" returns to standard catalog
    const exitBtn = screen.getByRole("button", { name: /일반 메뉴판/i });
    fireEvent.click(exitBtn);

    expect(useAccessibilityStore.getState().orderMode).toBe("standard");
  });

  it("renders OS keyboard style OneHandedContainer with flip and expand controls", async () => {
    // 1. none mode
    useAccessibilityStore.getState().setOneHandedMode("none");
    const { rerender, container } = render(
      <OneHandedContainer>
        <div>Content Area</div>
      </OneHandedContainer>,
    );

    expect(screen.queryByLabelText("한손 모드 방향 및 복귀 제어")).not.toBeInTheDocument();

    // 2. left mode: rail on right with ArrowRight and Maximize2
    useAccessibilityStore.getState().setOneHandedMode("left");
    rerender(
      <OneHandedContainer>
        <div>Content Area</div>
      </OneHandedContainer>,
    );

    expect(screen.getByLabelText("한손 모드 방향 및 복귀 제어")).toBeInTheDocument();
    const toRightBtn = screen.getByRole("button", { name: "오른손 모드로 전환" });
    const expandBtn = screen.getByRole("button", { name: "양손 전체 화면으로 복귀" });
    expect(toRightBtn).toBeInTheDocument();
    expect(expandBtn).toBeInTheDocument();

    // Click flip to right
    fireEvent.click(toRightBtn);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("right");

    // 3. right mode: rail on left with ArrowLeft
    rerender(
      <OneHandedContainer>
        <div>Content Area</div>
      </OneHandedContainer>,
    );

    const toLeftBtn = screen.getByRole("button", { name: "왼손 모드로 전환" });
    expect(toLeftBtn).toBeInTheDocument();

    // Click expand full
    fireEvent.click(screen.getByRole("button", { name: "양손 전체 화면으로 복귀" }));
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("none");

    // Axe check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
