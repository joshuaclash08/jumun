import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "vitest-axe";
import { WizardOrderView } from "@/components/flow/WizardOrderView";
import { MenuClientView } from "@/components/flow/MenuClientView";
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
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />;
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

  it("renders Prototype VoiceOver notice banner explaining difference from native OS VoiceOver", () => {
    render(
      <WizardOrderView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
        onExitWizard={vi.fn()}
      />,
    );

    // Note banner should be present
    expect(screen.getByText("※ 프로토타입 음성 안내 알림")).toBeInTheDocument();
    expect(
      screen.getByText(/본 웹 시연에서는 음성 합성\(TTS\)으로 동작을 체험할 수 있으며/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/향후 실제 상용 앱에서는 스마트폰 OS 내장 VoiceOver \/ TalkBack과 네이티브로 정밀 연동됩니다/i),
    ).toBeInTheDocument();
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

    // Step 3: Option selection
    expect(screen.getByRole("button", { name: /따뜻하게 \(HOT\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /시원하게 \(ICE\)/i })).toBeInTheDocument();

    // Select ICE option
    const iceOptionBtn = screen.getByRole("button", { name: /시원하게 \(ICE\)/i });
    fireEvent.click(iceOptionBtn);

    // Click direct checkout
    const checkoutBtn = screen.getByRole("button", { name: /이 메뉴 바로 결제하기/i });
    fireEvent.click(checkoutBtn);

    // Step 4: Checkout summary
    expect(screen.getByText("주문 및 결제 확인")).toBeInTheDocument();
    expect(screen.getByText("총 5,000원 결제하기")).toBeInTheDocument();
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

  it("allows switching between standard menu and wizard mode in MenuClientView", async () => {
    render(
      <MenuClientView
        categories={mockCategories}
        products={mockProducts}
        storeInfo={mockStoreInfo}
      />,
    );

    // Find wizard trigger banner
    const wizardTrigger = screen.getByRole("button", {
      name: /단계별 간편 주문 \(위저드 UI\)/i,
    });
    expect(wizardTrigger).toBeInTheDocument();

    // Click to enter wizard mode
    fireEvent.click(wizardTrigger);

    // Now in wizard mode
    await waitFor(() => {
      expect(screen.getByText("어떤 메뉴를 드실까요?")).toBeInTheDocument();
    });
    expect(screen.getByText("※ 프로토타입 음성 안내 알림")).toBeInTheDocument();

    // Click exit wizard
    const exitBtn = screen.getByRole("button", { name: /일반 메뉴판으로 나가기/i });
    fireEvent.click(exitBtn);

    // Returned to standard catalog view
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /단계별 간편 주문 \(위저드 UI\)/i }),
      ).toBeInTheDocument();
    });
  });
});
