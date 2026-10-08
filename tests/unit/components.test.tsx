import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
import { MenuCategoryHeader } from "@/components/flow/MenuCategoryHeader";
import { FontScaleSelector } from "@/components/settings/FontScaleSelector";
import { OneHandedModeSelector } from "@/components/settings/OneHandedModeSelector";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { OptionGroupList } from "@/components/flow/OptionGroupList";
import { SelectionCard } from "@/components/flow/SelectionCard";
import { MenuSearchSection } from "@/components/flow/MenuSearchSection";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useToastStore } from "@/store/useToastStore";
import type { Product, CartItem, OrderReceipt, StoreListing, ProductOptionGroup, MenuCategory } from "@/lib/types";

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
    useAccessibilityStore.getState().setLanguage("ko");
  });

  const sampleProduct: Product = {
    id: "prod-americano",
    category: "coffee",
    nameKo: "아메리카노",
    descriptionKo: "깊고 풍부한 바디감의 에스프레소에 물을 더한 클래식 커피",
    voiceDescriptionKo: "아메리카노, 4,500원, 깊고 풍부한 바디감의 클래식 커피",
    price: 4500,
    imageUrl: "/images/menu/americano.jpg",
    available: true,
    popularityRank: 1,
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

  it("renders ProductCard with concise accessible label (name, price) and visible text", () => {
    render(<ProductCard product={sampleProduct} onClick={() => {}} />);
    // ProductCard now uses concise accessible name (name, price) for VoiceOver/TalkBack
    // without verbose description sentences that clutter screen reader navigation.
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
    expect(screen.getByText("1개")).toBeInTheDocument();

    const itemButton = screen.getByRole("button", {
      name: "아메리카노, 4,500원, 인기 1위 메뉴",
    });
    fireEvent.click(itemButton);
    expect(clickedProduct).toEqual(sampleProduct);
  });

  it("renders sold-out state when product is unavailable", () => {
    const soldOutProduct = { ...sampleProduct, available: false };
    render(<ProductCard product={soldOutProduct} onClick={() => {}} />);
    const cardButton = screen.getByRole("button");
    // Sold-out cards stay focusable/announced for screen readers (no native
    // `disabled`) -- they use aria-disabled instead, per ProductCard.tsx.
    expect(cardButton).toHaveAttribute("aria-disabled", "true");
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

  it("renders HeaderBar with store title, settings link, clickable dine-in table link, and passes axe check", async () => {
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

    // No back link on the root menu view; table badge itself is a link to change the table
    const tableLink = screen.getByRole("link", { name: "3번 테이블, 테이블 변경하기" });
    expect(tableLink).toBeInTheDocument();
    expect(tableLink).toHaveAttribute("href", "/order/jumun-cafe-01/table");
    expect(screen.getByRole("link", { name: "설정 열기" })).toBeInTheDocument();
    expect(screen.getByText("주문 카페 1호점")).toBeInTheDocument();
    expect(screen.getByText("3번 테이블")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders HeaderBar in takeout mode with clickable takeout badge and passes axe check", async () => {
    const { container } = render(
      <HeaderBar
        storeInfo={{
          storeId: "jumun-cafe-01",
          storeName: "주문 카페 1호점",
          orderType: "takeout",
        }}
      />
    );

    const takeoutLink = screen.getByRole("link", { name: "포장, 주문 방식 변경하기" });
    expect(takeoutLink).toBeInTheDocument();
    expect(takeoutLink).toHaveAttribute("href", "/order/jumun-cafe-01");
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

    // Initial state in drawer: 6 multi-select options, close, call
    expect(screen.getByRole("button", { name: "물티슈" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "앞치마" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "앞접시" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "영수증" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수저" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "직원호출" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "호출하기" })).toBeInTheDocument();

    // Multi-select items
    const wipesBtn = screen.getByRole("button", { name: "물티슈" });
    expect(wipesBtn).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(wipesBtn);
    expect(wipesBtn).toHaveAttribute("aria-pressed", "true");

    const plateBtn = screen.getByRole("button", { name: "앞접시" });
    fireEvent.click(plateBtn);
    expect(plateBtn).toHaveAttribute("aria-pressed", "true");

    // Drawer passes axe check when open
    const axeResult = await axe(document.body);
    expect(axeResult).toHaveNoViolations();

    // Confirm call (closes drawer immediately, no hanging success sheet)
    fireEvent.click(screen.getByRole("button", { name: "호출하기" }));

    // Drawer closes and no hanging success screen is rendered
    expect(screen.queryByText("호출이 완료되었어요!")).not.toBeInTheDocument();
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

    // Accessible full-screen dialog semantics
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "아메리카노");

    // No blur/gradient overlays in DOM
    expect(document.querySelector(".backdrop-blur-\\[1px\\]")).toBeNull();
  });

  it("closes ProductDetailSheet via back button and Escape key and traps keyboard focus", () => {
    const handleOpenChange = vi.fn();
    const { unmount } = render(
      <ProductDetailSheet
        product={sampleProduct}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    // Back button uses safe-area-inset-top positioning
    const backBtnContainer = document.querySelector(".top-\\[calc\\(0\\.875rem\\+env\\(safe-area-inset-top\\,0px\\)\\)\\]");
    expect(backBtnContainer).toBeInTheDocument();

    // Focus is initially moved into dialog
    const dialog = screen.getByRole("dialog");
    expect(document.activeElement).toBe(dialog);

    // Keyboard Tab traps focus inside dialog
    const backBtn = screen.getByRole("button", { name: "메뉴 상세 닫기" });
    const cartBtn = screen.getByRole("button", { name: /담기/ });

    // Shift+Tab from dialog/first element wraps to last element
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(cartBtn);

    // Tab from last element wraps to first element (backBtn)
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(backBtn);

    // Clicking back button invokes onOpenChange(false)
    fireEvent.click(backBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    // Pressing Escape invokes onOpenChange(false)
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleOpenChange).toHaveBeenCalledTimes(2);

    unmount();
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

    const vanillaBtn = screen.getByRole("checkbox", { name: /바닐라/ });
    const caramelBtn = screen.getByRole("checkbox", { name: /카라멜/ });

    // Select first option
    fireEvent.click(vanillaBtn);
    expect(vanillaBtn).toHaveAttribute("aria-checked", "true");

    // Attempt to select second option exceeding maxSelections (1)
    fireEvent.click(caramelBtn);
    expect(caramelBtn).toHaveAttribute("aria-checked", "false");

    const toasts = useToastStore.getState().toasts;
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

  it("renders FontScaleSelector with minimalist Toss-style snap slider, '작게'/'크게' labels, and no preview or percentages", () => {
    useAccessibilityStore.getState().resetAll();
    const { container } = render(<FontScaleSelector />);

    // Accessible slider role and attributes
    const slider = screen.getByRole("slider", { name: "글자 크기 선택" });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "1");
    expect(slider).toHaveAttribute("aria-valuemin", "0.9");
    expect(slider).toHaveAttribute("aria-valuemax", "1.45");
    expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    expect(slider).toHaveAttribute("aria-valuetext", "보통");

    // "작게" and "크게" labels above the slider
    expect(screen.getByText("작게")).toBeInTheDocument();
    expect(screen.getByText("크게")).toBeInTheDocument();

    // Verify preview card and percentage texts are completely removed
    expect(screen.queryByText("아메리카노")).not.toBeInTheDocument();
    expect(screen.queryByText("미리보기")).not.toBeInTheDocument();
    expect(screen.queryByText("100%")).not.toBeInTheDocument();

    // Verify A- and A+ stepper buttons are completely removed
    expect(screen.queryByText("A-")).not.toBeInTheDocument();
    expect(screen.queryByText("A+")).not.toBeInTheDocument();

    // Keyboard navigation on slider: ArrowRight steps up to 1.15
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.15);

    // ArrowRight steps up to 1.3
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.3);

    // ArrowLeft steps down to 1.15
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.15);

    // Home jumps to min (0.9)
    fireEvent.keyDown(slider, { key: "Home" });
    expect(useAccessibilityStore.getState().fontScale).toBe(0.9);

    // End jumps to max (1.45)
    fireEvent.keyDown(slider, { key: "End" });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.45);

    // Pointer drag along the track
    const track = container.querySelector(".touch-none") as HTMLElement;
    expect(track).toBeInTheDocument();
    track.getBoundingClientRect = () => ({
      width: 224,
      height: 32,
      top: 0,
      left: 0,
      right: 224,
      bottom: 32,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Pointer down at left edge (clientX = 14 -> ratio = 0 -> step 0 (0.9))
    fireEvent.pointerDown(track, { clientX: 14, pointerId: 1 });
    expect(useAccessibilityStore.getState().fontScale).toBe(0.9);

    // Pointer move to middle (clientX = 112 -> ratio = 0.5 -> step 2 (1.15))
    fireEvent.pointerMove(track, { clientX: 112, pointerId: 1 });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.15);

    // Pointer move to right edge (clientX = 220 -> ratio = 1.0 -> step 4 (1.45))
    fireEvent.pointerMove(track, { clientX: 220, pointerId: 1 });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.45);

    // Pointer up releases drag
    fireEvent.pointerUp(track, { clientX: 220, pointerId: 1 });
    expect(useAccessibilityStore.getState().fontScale).toBe(1.45);
  });

  it("renders LanguageSelector with native OS dropdown and switches locale", () => {
    useAccessibilityStore.getState().resetAll();
    render(<LanguageSelector />);

    const select = screen.getByRole("combobox", { name: "언어 (Language)" });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("ko");

    fireEvent.change(select, { target: { value: "en" } });
    expect(useAccessibilityStore.getState().language).toBe("en");

    fireEvent.change(select, { target: { value: "ko" } });
    expect(useAccessibilityStore.getState().language).toBe("ko");
  });

  it("renders OneHandedModeSelector with reordered options left, none, right and updates store", () => {
    useAccessibilityStore.getState().resetAll();
    render(<OneHandedModeSelector />);

    const group = screen.getByRole("radiogroup", { name: "한손 조작 방향 선택" });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);

    // Strict order: [left, none, right] -> ["왼손", "중앙", "오른손"]
    expect(radios[0]).toHaveTextContent("왼손");
    expect(radios[1]).toHaveTextContent("중앙");
    expect(radios[2]).toHaveTextContent("오른손");

    // Default is none ("중앙")
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("none");

    // Select "왼손"
    fireEvent.click(radios[0]);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("left");

    // Select "오른손"
    fireEvent.click(radios[2]);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("right");

    // Select "중앙"
    fireEvent.click(radios[1]);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("none");
  });

  it("renders quick menu layout toggle button in MenuCategoryHeader and toggles layout", () => {
    useAccessibilityStore.setState({ menuLayout: "grid" });
    const categories = [
      { id: "popular", labelKo: "인기" },
      { id: "coffee", labelKo: "커피" },
    ];
    render(
      <MenuCategoryHeader
        categories={categories}
        activeCategoryId="popular"
        onCategorySelect={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole("button", { name: "리스트형으로 보기" });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(useAccessibilityStore.getState().menuLayout).toBe("list");

    const gridToggleBtn = screen.getByRole("button", { name: "카드형으로 보기" });
    expect(gridToggleBtn).toBeInTheDocument();

    fireEvent.click(gridToggleBtn);
    expect(useAccessibilityStore.getState().menuLayout).toBe("grid");
  });

  it("renders MenuCategoryHeader with WAI-ARIA tablist and handles roving tabindex arrow navigation", () => {
    const categories = [
      { id: "popular", labelKo: "인기" },
      { id: "coffee", labelKo: "커피" },
      { id: "dessert", labelKo: "디저트" },
    ];
    const onSelect = vi.fn();

    render(
      <MenuCategoryHeader
        categories={categories}
        activeCategoryId="popular"
        onCategorySelect={onSelect}
      />
    );

    const tablist = screen.getByRole("tablist", { name: "메뉴 카테고리" });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);

    // Active tab has aria-selected="true" and tabIndex=0
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    // Inactive tabs have tabIndex=-1
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");

    // ArrowRight navigates to next tab
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(onSelect).toHaveBeenCalledWith("coffee");

    // ArrowLeft wraps around to last tab
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenCalledWith("dessert");

    // End key jumps to last tab
    fireEvent.keyDown(tabs[0], { key: "End" });
    expect(onSelect).toHaveBeenCalledWith("dessert");

    // Home key jumps to first tab
    fireEvent.keyDown(tabs[2], { key: "Home" });
    expect(onSelect).toHaveBeenCalledWith("popular");
  });

  it("handles category clicks and supports rapid category changes without layout errors", () => {
    const categories = [
      { id: "popular", labelKo: "인기" },
      { id: "coffee", labelKo: "커피" },
      { id: "dessert", labelKo: "디저트" },
    ];
    const onSelect = vi.fn();

    const { rerender } = render(
      <MenuCategoryHeader
        categories={categories}
        activeCategoryId="popular"
        onCategorySelect={onSelect}
      />
    );

    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[1]);
    expect(onSelect).toHaveBeenCalledWith("coffee");

    // Rapid external category updates (simulating fast scrollspy)
    rerender(
      <MenuCategoryHeader
        categories={categories}
        activeCategoryId="dessert"
        onCategorySelect={onSelect}
      />
    );
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });

  it("renders FeaturedMenuSection carousel with roving tabindex for card items", () => {
    const products: Product[] = [
      { ...sampleProduct, id: "p1", nameKo: "인기1", popularityRank: 1 },
      { ...sampleProduct, id: "p2", nameKo: "인기2", popularityRank: 2 },
    ];

    render(<FeaturedMenuSection products={products} onProductClick={() => {}} />);

    const carousel = screen.getByRole("region", { name: /인기 메뉴/ });
    expect(carousel).toHaveAttribute("aria-roledescription", "캐러셀");

    const cards = screen.getAllByRole("button", { name: /인기\d, 4,500원/ });
    expect(cards).toHaveLength(2);

    // First card has tabIndex=0, second has tabIndex=-1
    expect(cards[0]).toHaveAttribute("tabindex", "0");
    expect(cards[1]).toHaveAttribute("tabindex", "-1");

    // ArrowRight moves focus to the second card
    fireEvent.keyDown(cards[0], { key: "ArrowRight" });
    expect(cards[1]).toHaveAttribute("tabindex", "0");
    expect(cards[0]).toHaveAttribute("tabindex", "-1");
  });

  it("ensures ProductCard is a single button tab stop without outer wrapper tabindex", () => {
    const { container } = render(<ProductCard product={sampleProduct} onClick={() => {}} />);

    const button = screen.getByRole("button", { name: "아메리카노, 4,500원" });
    expect(button).toBeInTheDocument();

    // Verify button is the root interactive element and has no parent wrapper with tabindex
    const focusableElements = container.querySelectorAll('[tabindex]:not([tabindex="-1"])');
    // Only the button (or 0 if default button tab stop) should be focusable, no outer div with tabindex="0"
    focusableElements.forEach((el) => {
      expect(el.tagName.toLowerCase()).toBe("button");
    });
  });

  it("renders ProductCard in row layout with flat canvas styling, badges, and strikethrough price", () => {
    const discountedProduct: Product = {
      ...sampleProduct,
      isPopular: true,
      isNew: true,
      originalPrice: 5000,
      price: 4500,
    };

    render(
      <ProductCard product={discountedProduct} layout="row" onClick={() => {}} />
    );

    const button = screen.getByRole("button", { name: "아메리카노, 4,500원" });
    expect(button).toBeInTheDocument();
    // Flat canvas styling in row mode: borderless, shadowless, transparent bg
    expect(button.className).toContain("border-0");
    expect(button.className).toContain("shadow-none");
    expect(button.className).toContain("bg-transparent");

    // Badges present as rounded pills
    const popBadge = screen.getByText("인기");
    const newBadge = screen.getByText("신규");
    expect(popBadge).toBeInTheDocument();
    expect(newBadge).toBeInTheDocument();
    expect(popBadge.className).toContain("rounded-full");
    expect(newBadge.className).toContain("rounded-full");

    // Original price and current price
    expect(screen.getByText("5,000원")).toBeInTheDocument();
    expect(screen.getByText("4,500원")).toBeInTheDocument();

    // Layout order: text container on left, food image on right
    const children = Array.from(button.children);
    expect(children.length).toBe(2);
    // First child is text container (contains title)
    expect(children[0]).toHaveTextContent("아메리카노");
    // Second child contains image
    expect(children[1].querySelector("img")).toBeInTheDocument();
  });

  it("renders Switch with uniform 2px padding and non-distorting geometry", () => {
    const { container, rerender } = render(<Switch checked={false} onCheckedChange={() => {}} />);
    const rootEl = container.querySelector('[data-slot="switch"]');
    const thumbEl = container.querySelector('[data-slot="switch-thumb"]');

    expect(rootEl).toBeInTheDocument();
    expect(thumbEl).toBeInTheDocument();
    expect(rootEl?.className).toContain("data-[size=default]:p-[2px]");
    expect(thumbEl?.className).toContain("group-data-[size=default]/switch:translate-x-0");

    rerender(<Switch checked={true} onCheckedChange={() => {}} />);
    expect(thumbEl?.className).toContain("group-data-[size=default]/switch:data-checked:translate-x-[20px]");
  });
});

describe("Separator Primitives", () => {
  it("renders default hairline separator and section gutter variant", () => {
    const { container, rerender } = render(<Separator />);
    const hairlineEl = container.querySelector('[data-slot="separator"]');
    expect(hairlineEl).toBeInTheDocument();
    expect(hairlineEl?.className).toContain("data-horizontal:h-px");
    expect(hairlineEl?.className).toContain("data-vertical:self-stretch");

    rerender(<Separator variant="section" />);
    const sectionEl = container.querySelector('[data-slot="separator"]');
    expect(sectionEl?.className).toContain("data-horizontal:h-2");
    expect(sectionEl?.className).toContain("data-vertical:self-stretch");

    rerender(<Separator inset="center" />);
    const insetEl = container.querySelector('[data-slot="separator"]');
    expect(insetEl?.className).toContain("data-horizontal:mx-4");

    rerender(<Separator orientation="vertical" variant="hairline" />);
    const vertEl = container.querySelector('[data-slot="separator"]');
    expect(vertEl?.className).toContain("data-vertical:w-px");
    expect(vertEl?.className).toContain("data-vertical:self-stretch");
  });

  it("renders labeled separator with accessible role and text", () => {
    render(<Separator label="OR" />);
    const sep = screen.getByRole("separator");
    expect(sep).toBeInTheDocument();
    expect(screen.getByText("OR")).toBeInTheDocument();
  });
});

describe("OptionGroupList Component", () => {
  const singleGroup: ProductOptionGroup = {
    id: "size",
    labelKo: "사이즈",
    required: true,
    selectionType: "single",
    options: [
      { id: "regular", labelKo: "Regular", priceDelta: 0 },
      { id: "large", labelKo: "Large", priceDelta: 1000 },
    ],
  };

  const multiGroup: ProductOptionGroup = {
    id: "topping",
    labelKo: "토핑",
    required: false,
    selectionType: "multiple",
    options: [
      { id: "pearl", labelKo: "펄 추가", priceDelta: 500 },
      { id: "shot", labelKo: "샷 추가", priceDelta: 500 },
    ],
  };

  it("renders single-choice groups with role='radiogroup' and children with role='radio'", () => {
    const onToggle = vi.fn();
    render(
      <OptionGroupList
        groups={[singleGroup]}
        selections={{ size: ["regular"] }}
        onOptionToggle={onToggle}
      />
    );

    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");

    fireEvent.click(radios[1]);
    expect(onToggle).toHaveBeenCalledWith(singleGroup, "large");
  });

  it("renders multi-choice groups with role='group' and children with role='checkbox'", () => {
    const onToggle = vi.fn();
    render(
      <OptionGroupList
        groups={[multiGroup]}
        selections={{ topping: ["pearl"] }}
        onOptionToggle={onToggle}
      />
    );

    const group = screen.getByRole("group");
    expect(group).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-checked", "false");

    fireEvent.click(checkboxes[1]);
    expect(onToggle).toHaveBeenCalledWith(multiGroup, "shot");
  });

  it("displays accessible heading and required badge", () => {
    render(
      <OptionGroupList
        groups={[singleGroup]}
        selections={{}}
        onOptionToggle={vi.fn()}
      />
    );

    const heading = screen.getByRole("heading", { name: "사이즈" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("필수")).toBeInTheDocument();
  });

  it("passes axe accessibility checks on OptionGroupList", async () => {
    const { container } = render(
      <OptionGroupList
        groups={[singleGroup, multiGroup]}
        selections={{ size: ["regular"] }}
        onOptionToggle={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("SelectionCard Component", () => {
  it("renders with role='radio' and aria-checked when role='radio'", () => {
    render(
      <SelectionCard
        isSelected={true}
        onClick={vi.fn()}
        label="신용카드"
        reduceMotion={true}
        role="radio"
      />
    );

    const radio = screen.getByRole("radio", { name: "신용카드" });
    expect(radio).toBeInTheDocument();
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("renders with aria-pressed when role is button or unspecified", () => {
    render(
      <SelectionCard
        isSelected={false}
        onClick={vi.fn()}
        label="매장 식사"
        reduceMotion={true}
      />
    );

    const btn = screen.getByRole("button", { name: "매장 식사" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });
});

describe("MenuSearchSection Component", () => {
  const searchCategories: MenuCategory[] = [
    { id: "coffee", labelKo: "커피", titleI18n: { languages: { "en-US": "Coffee" } } },
  ];

  const searchProducts: Product[] = [
    {
      id: "p-americano",
      category: "coffee",
      nameKo: "아메리카노",
      descriptionKo: "진한 에스프레소와 물의 조화",
      voiceDescriptionKo: "아메리카노",
      titleI18n: { languages: { "en-US": "Americano" } },
      price: 4500,
      imageUrl: "/images/menu/americano.jpg",
      available: true,
      optionGroups: [],
    },
    {
      id: "p-latte",
      category: "coffee",
      nameKo: "카페라떼",
      descriptionKo: "부드러운 우유와 에스프레소",
      voiceDescriptionKo: "카페라떼",
      titleI18n: { languages: { "en-US": "Cafe Latte" } },
      price: 5000,
      imageUrl: "/images/menu/latte.jpg",
      available: true,
      optionGroups: [],
    },
  ];

  it("searches menu items using Hangul initial consonants (choseong)", () => {
    render(
      <MenuSearchSection
        products={searchProducts}
        categories={searchCategories}
        onProductClick={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", { name: /메뉴 검색/ });
    fireEvent.change(input, { target: { value: "ㅇㅁㄹㅋㄴ" } });

    expect(screen.getByText("아메리카노")).toBeInTheDocument();
    expect(screen.queryByText("카페라떼")).not.toBeInTheDocument();
  });

  it("searches menu items using description initial consonants (choseong)", () => {
    render(
      <MenuSearchSection
        products={searchProducts}
        categories={searchCategories}
        onProductClick={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", { name: /메뉴 검색/ });
    fireEvent.change(input, { target: { value: "ㅈㅎ" } });

    expect(screen.getByText("아메리카노")).toBeInTheDocument();
    expect(screen.queryByText("카페라떼")).not.toBeInTheDocument();
  });

  it("searches menu items using multi-token queries combining choseong and English", () => {
    render(
      <MenuSearchSection
        products={searchProducts}
        categories={searchCategories}
        onProductClick={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", { name: /메뉴 검색/ });
    fireEvent.change(input, { target: { value: "ㅋㅍ latte" } });

    expect(screen.getByText("카페라떼")).toBeInTheDocument();
    expect(screen.queryByText("아메리카노")).not.toBeInTheDocument();
  });

  it("clears search input when clear button is clicked", async () => {
    render(
      <MenuSearchSection
        products={searchProducts}
        categories={searchCategories}
        onProductClick={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", { name: /메뉴 검색/ });
    fireEvent.change(input, { target: { value: "아메리카노" } });
    expect(input).toHaveValue("아메리카노");

    const clearBtn = screen.getByRole("button", { name: /검색어 지우기/ });
    fireEvent.click(clearBtn);

    expect(input).toHaveValue("");
    await waitFor(() => {
      expect(screen.queryByText("검색 결과")).not.toBeInTheDocument();
    });
  });
});


