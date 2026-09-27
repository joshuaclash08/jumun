import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SetupPage from "@/app/setup/page";
import SettingsPage from "@/app/settings/page";
import { SetupGuard } from "@/components/flow/SetupGuard";
import {
  SETUP_COMPLETED_KEY,
  SETUP_PATH,
  sanitizeReturnTo,
} from "@/lib/constants/setup";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
let currentPathname = "/";
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => mockSearchParams,
}));

describe("Setup Onboarding Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    currentPathname = "/";
    mockSearchParams = new URLSearchParams();
  });

  describe("sanitizeReturnTo helper", () => {
    it("handles null, empty, or whitespace strings", () => {
      expect(sanitizeReturnTo(null)).toBe("/");
      expect(sanitizeReturnTo("")).toBe("/");
      expect(sanitizeReturnTo("   ")).toBe("/");
    });

    it("resets self-referencing /settings, /setting, or /setup to /", () => {
      expect(sanitizeReturnTo("/settings")).toBe("/");
      expect(sanitizeReturnTo("/setting")).toBe("/");
      expect(sanitizeReturnTo("/setup")).toBe("/");
      expect(sanitizeReturnTo("/settings/payment")).toBe("/");
    });

    it("unwraps nested returnTo parameters produced by redirect loops", () => {
      const nested =
        "/settings?returnTo=%2Forder%2Fjumun-cafe-01%3Ftable%3D2";
      expect(sanitizeReturnTo(nested)).toBe("/order/jumun-cafe-01?table=2");

      const doubleNested =
        "/setup?returnTo=/settings?returnTo%3D%252Forder%252Fjumun-cafe-01%253Ftable%253D2";
      expect(sanitizeReturnTo(doubleNested)).toBe(
        "/order/jumun-cafe-01?table=2"
      );
    });

    it("preserves valid application destinations", () => {
      expect(sanitizeReturnTo("/order/jumun-cafe-01?table=2")).toBe(
        "/order/jumun-cafe-01?table=2"
      );
      expect(sanitizeReturnTo("/order/store-123")).toBe("/order/store-123");
    });
  });

  describe("SetupGuard Component", () => {
    it("redirects to /setup?returnTo=... when localStorage has no setup key on normal pages", async () => {
      currentPathname = "/order/jumun-cafe-01";
      render(
        <SetupGuard>
          <div data-testid="protected-content">Protected Content</div>
        </SetupGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          `${SETUP_PATH}?returnTo=${encodeURIComponent("/order/jumun-cafe-01")}`
        );
      });
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("preserves search params in returnTo URL when redirecting", async () => {
      currentPathname = "/order/jumun-cafe-01";
      Object.defineProperty(window, "location", {
        writable: true,
        value: { search: "?table=A3&type=dine-in" },
      });

      render(
        <SetupGuard>
          <div data-testid="protected-content">Protected Content</div>
        </SetupGuard>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          `${SETUP_PATH}?returnTo=${encodeURIComponent("/order/jumun-cafe-01?table=A3&type=dine-in")}`
        );
      });
    });

    it("does not redirect when on the /setup page itself", async () => {
      currentPathname = "/setup";
      render(
        <SetupGuard>
          <div data-testid="setup-content">Setup Content</div>
        </SetupGuard>
      );

      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId("setup-content")).toBeInTheDocument();
    });

    it("does NOT redirect when on /settings or /setting (allowing user to configure settings)", async () => {
      currentPathname = "/settings";
      render(
        <SetupGuard>
          <div data-testid="settings-content">Settings Content</div>
        </SetupGuard>
      );

      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId("settings-content")).toBeInTheDocument();

      currentPathname = "/settings/payment";
      render(
        <SetupGuard>
          <div data-testid="payment-settings-content">Payment Settings</div>
        </SetupGuard>
      );
      expect(mockReplace).not.toHaveBeenCalled();
      expect(
        screen.getByTestId("payment-settings-content")
      ).toBeInTheDocument();
    });

    it("renders children without redirect when setup was already completed", async () => {
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
      currentPathname = "/";

      render(
        <SetupGuard>
          <div data-testid="page-content">Home Content</div>
        </SetupGuard>
      );

      expect(mockReplace).not.toHaveBeenCalled();
      expect(screen.getByTestId("page-content")).toBeInTheDocument();
    });
  });

  describe("SetupPage (/setup)", () => {
    it("renders two buttons: '네, 설정할래요' and '괜찮아요, 바로 시작할게요'", () => {
      render(<SetupPage />);

      expect(
        screen.getByRole("heading", { name: "주문을 도와드릴까요?" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /네, 설정할래요/ })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /괜찮아요, 바로 시작할게요/ })
      ).toBeInTheDocument();
    });

    it("navigates to /settings?returnTo=... when '네, 설정할래요' is clicked", () => {
      mockSearchParams = new URLSearchParams("returnTo=/order/jumun-cafe-01");
      render(<SetupPage />);

      const needHelpBtn = screen.getByRole("button", { name: /네, 설정할래요/ });
      fireEvent.click(needHelpBtn);

      expect(mockPush).toHaveBeenCalledWith(
        `/settings?returnTo=${encodeURIComponent("/order/jumun-cafe-01")}`
      );
    });

    it("unwraps corrupted or nested returnTo when clicking '네, 설정할래요'", () => {
      mockSearchParams = new URLSearchParams(
        "returnTo=/settings?returnTo=%2Forder%2Fjumun-cafe-01%3Ftable%3D2"
      );
      render(<SetupPage />);

      const needHelpBtn = screen.getByRole("button", { name: /네, 설정할래요/ });
      fireEvent.click(needHelpBtn);

      expect(mockPush).toHaveBeenCalledWith(
        `/settings?returnTo=${encodeURIComponent("/order/jumun-cafe-01?table=2")}`
      );
    });

    it("marks setup as complete in localStorage and navigates to returnTo when '괜찮아요' is clicked", () => {
      mockSearchParams = new URLSearchParams("returnTo=/order/jumun-cafe-01");
      render(<SetupPage />);

      const noHelpBtn = screen.getByRole("button", {
        name: /괜찮아요, 바로 시작할게요/,
      });
      fireEvent.click(noHelpBtn);

      expect(localStorage.getItem(SETUP_COMPLETED_KEY)).toBe("true");
      expect(mockReplace).toHaveBeenCalledWith("/order/jumun-cafe-01");
    });
  });

  describe("SettingsPage (/settings) returnTo handling", () => {
    it("navigates to returnTo and marks setup completed when '설정 완료' is clicked", async () => {
      mockSearchParams = new URLSearchParams("returnTo=/order/jumun-cafe-01");
      render(<SettingsPage />);

      const completeBtn = screen.getByRole("button", { name: "설정 완료" });
      fireEvent.click(completeBtn);

      expect(localStorage.getItem(SETUP_COMPLETED_KEY)).toBe("true");

      await waitFor(
        () => {
          expect(mockReplace).toHaveBeenCalledWith("/order/jumun-cafe-01");
        },
        { timeout: 500 }
      );
    });

    it("navigates to returnTo and marks setup completed when header back button is clicked", () => {
      mockSearchParams = new URLSearchParams("returnTo=/order/jumun-cafe-01");
      render(<SettingsPage />);

      const backBtn = screen.getByRole("button", {
        name: "이전 화면으로 돌아가기",
      });
      fireEvent.click(backBtn);

      expect(localStorage.getItem(SETUP_COMPLETED_KEY)).toBe("true");
      expect(mockReplace).toHaveBeenCalledWith("/order/jumun-cafe-01");
    });

    it("falls back to / if returnTo is /settings or /setup", () => {
      mockSearchParams = new URLSearchParams("returnTo=/settings");
      render(<SettingsPage />);

      const backBtn = screen.getByRole("button", {
        name: "이전 화면으로 돌아가기",
      });
      fireEvent.click(backBtn);

      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
