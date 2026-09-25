import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import SettingsPage from "@/app/settings/page";
import AccessibilityDetailPage from "@/app/settings/accessibility/page";
import PaymentSettingsPage from "@/app/settings/payment/page";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
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

describe("SettingsPage - Icon Removal & Checkbox Migration", () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
  });

  it("renders all settings text items without decorative icons", () => {
    render(<SettingsPage />);

    // Text labels
    expect(screen.getByText("화면 및 텍스트 상세 설정")).toBeInTheDocument();
    expect(screen.getByText("글자 크기")).toBeInTheDocument();
    expect(screen.getByText("고대비 모드")).toBeInTheDocument();
    expect(screen.getByText("난독증 친화 간격")).toBeInTheDocument();
    expect(screen.getByText("애니메이션 줄이기")).toBeInTheDocument();
    expect(screen.getByText("피드백 및 편의")).toBeInTheDocument();
    expect(screen.getByText("진동 피드백")).toBeInTheDocument();
    expect(screen.getByText("알림 표시 시간 2배 연장")).toBeInTheDocument();
    expect(screen.getByText("음성 안내 (보이스오버 체험)")).toBeInTheDocument();
    expect(screen.getByText("기본 결제 수단 관리")).toBeInTheDocument();
    expect(screen.getByText("언어 및 초기화")).toBeInTheDocument();
    expect(screen.getByText("설정 초기화")).toBeInTheDocument();

    // Checkboxes should exist for toggleable items
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(6); // highContrast, dyslexiaSpacing, reducedMotion, hapticsEnabled, timeoutExtension, voiceGuideEnabled
  });

  it("toggles high contrast mode when clicking the checkbox or label row", () => {
    render(<SettingsPage />);

    const highContrastCheckbox = screen.getByRole("checkbox", { name: "고대비 모드" });
    expect(useAccessibilityStore.getState().highContrast).toBe(false);

    fireEvent.click(highContrastCheckbox);
    expect(useAccessibilityStore.getState().highContrast).toBe(true);

    fireEvent.click(highContrastCheckbox);
    expect(useAccessibilityStore.getState().highContrast).toBe(false);
  });

  it("passes axe accessibility check with zero violations", async () => {
    const { container } = render(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("AccessibilityDetailPage & PaymentSettingsPage", () => {
  it("renders AccessibilityDetailPage with checkboxes and clean text", async () => {
    const { container } = render(<AccessibilityDetailPage />);
    expect(screen.getByRole("heading", { name: "접근성" })).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox").length).toBe(4); // voiceGuide, dyslexiaSpacing, haptics, timeoutExtension

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders PaymentSettingsPage with text-only payment cards", async () => {
    usePaymentStore.getState().setDefaultMethod("card");
    const { container } = render(<PaymentSettingsPage />);

    expect(screen.getByText("신용 / 체크카드")).toBeInTheDocument();
    expect(screen.getByText("간편 결제")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
