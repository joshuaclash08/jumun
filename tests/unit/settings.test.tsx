import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import SettingsPage from "@/app/settings/page";
import PaymentSettingsPage from "@/app/settings/payment/page";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/settings",
}));

describe("Checkbox Component", () => {
  it("renders unchecked by default and responds to clicks", () => {
    let isChecked = false;
    const { rerender } = render(
      <Checkbox
        id="test-cb"
        checked={isChecked}
        onCheckedChange={(val) => {
          isChecked = !!val;
        }}
        aria-label="테스트 체크박스"
      />
    );

    const checkbox = screen.getByRole("checkbox", { name: "테스트 체크박스" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(checkbox);
    expect(isChecked).toBe(true);

    rerender(
      <Checkbox
        id="test-cb"
        checked={isChecked}
        onCheckedChange={(val) => {
          isChecked = !!val;
        }}
        aria-label="테스트 체크박스"
      />
    );
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });
});

describe("SettingsPage - Switch Migration & Layout", () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
    useCartStore.getState().resetOrder();
  });

  it("renders all settings text items without decorative icons", () => {
    render(<SettingsPage />);

    // Text labels
    expect(screen.getByText("화면 및 텍스트 상세 설정")).toBeInTheDocument();
    expect(screen.getByText("화면 테마")).toBeInTheDocument();
    expect(screen.getByText("주문 화면 방식")).toBeInTheDocument();
    expect(screen.getByText("메뉴 보기 방식")).toBeInTheDocument();
    expect(screen.getByText("글자 크기")).toBeInTheDocument();
    expect(screen.getByText("한손 조작 모드")).toBeInTheDocument();
    expect(screen.getByText("고대비 모드")).toBeInTheDocument();
    expect(screen.getByText("난독증 친화 간격")).toBeInTheDocument();
    expect(screen.getByText("애니메이션 줄이기")).toBeInTheDocument();
    expect(screen.getByText("피드백 및 편의")).toBeInTheDocument();
    expect(screen.queryByText("진동 피드백")).not.toBeInTheDocument();
    expect(screen.getByText("알림 표시 시간 2배 연장")).toBeInTheDocument();
    expect(screen.getByText("음성 안내 (보이스오버 체험)")).toBeInTheDocument();
    expect(screen.getByText("기본 결제 수단 관리")).toBeInTheDocument();
    expect(screen.getByText("언어 (Language)")).toBeInTheDocument();
    expect(screen.getByText("설정 초기화")).toBeInTheDocument();

    // Switches should exist for toggleable items (excluding haptics on web)
    const switches = screen.getAllByRole("switch");
    expect(switches.length).toBe(5); // highContrast, dyslexiaSpacing, reducedMotion, timeoutExtension, voiceGuideEnabled
  });

  it("renders recent order card when lastReceipt is present and resets on clear", () => {
    useCartStore.setState({
      lastReceipt: {
        orderNumber: "101",
        items: [
          {
            id: "c1",
            productId: "p1",
            nameKo: "아메리카노",
            quantity: 2,
            selections: [],
            unitPrice: 4500,
          },
        ],
        subtotal: 9000,
        total: 9000,
        orderType: "dine-in",
        store: { storeId: "gangnam", storeName: "강남점", orderType: "dine-in", table: "1" },
        placedAt: new Date().toISOString(),
      },
    });

    render(<SettingsPage />);
    expect(screen.getByText("최근 주문 내역")).toBeInTheDocument();
    expect(screen.getByText(/주문번호.*101/)).toBeInTheDocument();
    expect(screen.getByText("아메리카노")).toBeInTheDocument();

    const clearBtn = screen.getByText("내역 삭제");
    fireEvent.click(clearBtn);
    expect(useCartStore.getState().lastReceipt).toBeNull();
  });

  it("toggles one-handed mode with reordered options left, none, right in settings", () => {
    render(<SettingsPage />);

    expect(useAccessibilityStore.getState().oneHandedMode).toBe("none");

    const leftRadio = screen.getByRole("radio", { name: "왼손" });
    fireEvent.click(leftRadio);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("left");

    const rightRadio = screen.getByRole("radio", { name: "오른손" });
    fireEvent.click(rightRadio);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("right");

    const centerRadio = screen.getByRole("radio", { name: "중앙" });
    fireEvent.click(centerRadio);
    expect(useAccessibilityStore.getState().oneHandedMode).toBe("none");
  });

  it("toggles menu layout mode between grid and list in settings", () => {
    render(<SettingsPage />);

    expect(useAccessibilityStore.getState().menuLayout).toBe("grid");

    const listRadio = screen.getByRole("radio", { name: "리스트형" });
    fireEvent.click(listRadio);
    expect(useAccessibilityStore.getState().menuLayout).toBe("list");

    const gridRadio = screen.getByRole("radio", { name: "카드형" });
    fireEvent.click(gridRadio);
    expect(useAccessibilityStore.getState().menuLayout).toBe("grid");
  });

  it("toggles high contrast mode when clicking the switch or label row", () => {
    render(<SettingsPage />);

    const highContrastSwitch = screen.getByRole("switch", { name: "고대비 모드" });
    expect(useAccessibilityStore.getState().highContrast).toBe(false);

    fireEvent.click(highContrastSwitch);
    expect(useAccessibilityStore.getState().highContrast).toBe(true);

    fireEvent.click(highContrastSwitch);
    expect(useAccessibilityStore.getState().highContrast).toBe(false);
  });

  it("does NOT trigger any toast notification when toggling settings or changing options", () => {
    useToastStore.setState({ toasts: [] });
    render(<SettingsPage />);

    // Toggle high contrast
    const highContrastSwitch = screen.getByRole("switch", { name: "고대비 모드" });
    fireEvent.click(highContrastSwitch);

    // Change language via dropdown
    const select = screen.getByRole("combobox", { name: "언어 (Language)" });
    fireEvent.change(select, { target: { value: "en" } });

    // Verify no toasts were pushed
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("passes axe accessibility check with zero violations", async () => {
    const { container } = render(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("PaymentSettingsPage", () => {
  it("renders PaymentSettingsPage with text-only payment cards", async () => {
    usePaymentStore.getState().setDefaultMethod("card");
    const { container } = render(<PaymentSettingsPage />);

    expect(screen.getByText("신용 / 체크카드")).toBeInTheDocument();
    expect(screen.getByText("간편 결제")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Settings i18n English Mode", () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
    useAccessibilityStore.getState().setLanguage("en");
  });

  it("renders SettingsPage in English when language is 'en'", async () => {
    const { container } = render(<SettingsPage />);

    expect(screen.getByText("Screen & Display Settings")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Order Screen Layout")).toBeInTheDocument();
    expect(screen.getByText("Font Size")).toBeInTheDocument();
    expect(screen.getByText("One-Handed Mode")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Left" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Center" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Right" })).toBeInTheDocument();
    expect(screen.getByText("High Contrast Mode")).toBeInTheDocument();
    expect(screen.getByText("Dyslexia-friendly Spacing")).toBeInTheDocument();
    expect(screen.getByText("Reduce Motion")).toBeInTheDocument();
    expect(screen.getByText("Feedback & Convenience")).toBeInTheDocument();
    expect(screen.getByText("Double Notification Duration")).toBeInTheDocument();
    expect(screen.getByText("Voice Guide (VoiceOver Preview)")).toBeInTheDocument();
    expect(screen.getByText("Manage Default Payment Method")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Reset Settings")).toBeInTheDocument();
    expect(screen.getByText("Save Settings")).toBeInTheDocument();

    // High contrast switch aria-label in English
    const highContrastSwitch = screen.getByRole("switch", { name: "High Contrast Mode" });
    expect(highContrastSwitch).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("dynamically switches language between Korean and English upon dropdown selection", () => {
    useAccessibilityStore.getState().setLanguage("ko");
    render(<SettingsPage />);

    expect(screen.getByText("화면 및 텍스트 상세 설정")).toBeInTheDocument();

    const select = screen.getByRole("combobox", { name: "언어 (Language)" });
    fireEvent.change(select, { target: { value: "en" } });

    expect(useAccessibilityStore.getState().language).toBe("en");
    expect(screen.getByText("Screen & Display Settings")).toBeInTheDocument();

    const selectEn = screen.getByRole("combobox", { name: "Language" });
    fireEvent.change(selectEn, { target: { value: "ko" } });

    expect(useAccessibilityStore.getState().language).toBe("ko");
    expect(screen.getByText("화면 및 텍스트 상세 설정")).toBeInTheDocument();
  });

  it("renders PaymentSettingsPage in English", async () => {
    usePaymentStore.getState().setDefaultMethod("card");
    render(<PaymentSettingsPage />);
    expect(screen.getByRole("heading", { name: "Manage Payment Methods" })).toBeInTheDocument();
    expect(screen.getByText("Credit / Debit Card")).toBeInTheDocument();
    expect(screen.getByText("Easy Pay")).toBeInTheDocument();
    expect(screen.getByText("Save Settings")).toBeInTheDocument();
  });
});
