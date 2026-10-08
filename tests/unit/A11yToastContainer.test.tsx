import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { A11yToastContainer } from "@/components/flow/A11yToastContainer";
import { useToastStore } from "@/store/useToastStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

describe("A11yToastContainer Portal & Layering", () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
    useToastStore.getState().clearAll();
    // Clean up any remaining elements in document.body
    const existing = document.querySelectorAll("[role='region']");
    existing.forEach((el) => el.remove());
  });

  it("renders toast in a portal on document.body with z-[100] layering", async () => {
    render(<A11yToastContainer />);

    // Push a test toast
    act(() => {
      useToastStore.getState().pushToast({
        id: "test-toast-1",
        kind: "error",
        messageKo: "최대 1개까지 선택할 수 있습니다.",
      });
    });

    const toastRegion = screen.getByRole("region", { name: "알림 메시지" });
    expect(toastRegion).toBeInTheDocument();
    // Must be directly mounted onto document.body via createPortal
    expect(toastRegion.parentElement).toBe(document.body);
    // Must have z-[100] to sit above DrawerOverlay and DrawerContent (z-50)
    expect(toastRegion.className).toContain("z-[100]");

    // Verify toast message text is rendered
    expect(screen.getByText("최대 1개까지 선택할 수 있습니다.")).toBeInTheDocument();
  });

  it("calculates clearance prioritizing open drawer action bar", async () => {
    // Simulate an open drawer with a sticky action bar
    const drawerContent = document.createElement("div");
    drawerContent.setAttribute("data-slot", "drawer-content");

    const drawerActionBar = document.createElement("div");
    drawerActionBar.setAttribute("data-sticky-action-bar", "true");
    // Mock getBoundingClientRect for drawerActionBar
    drawerActionBar.getBoundingClientRect = () => ({
      top: 600,
      bottom: 680,
      height: 80,
      width: 400,
      left: 0,
      right: 400,
      x: 0,
      y: 600,
      toJSON: () => {},
    });
    drawerContent.appendChild(drawerActionBar);
    document.body.appendChild(drawerContent);

    // Mock window.innerHeight
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });

    render(<A11yToastContainer />);

    act(() => {
      useToastStore.getState().pushToast({
        id: "test-toast-clearance",
        kind: "success",
        variant: "delete",
        messageKo: "장바구니에서 삭제되었습니다.",
      });
    });

    const toastRegion = screen.getByRole("region", { name: "알림 메시지" });
    // Clearance should be window.innerHeight (800) - rect.top (600) + 14 = 214px
    expect(toastRegion.style.bottom).toBe("214px");

    drawerContent.remove();
  });

  it("renders toast in English when language is set to 'en' and messageEn is provided", async () => {
    useAccessibilityStore.getState().setLanguage("en");
    render(<A11yToastContainer />);

    act(() => {
      useToastStore.getState().pushToast({
        id: "test-toast-en",
        kind: "success",
        messageKo: "장바구니에 담겼습니다.",
        messageEn: "Added to cart.",
      });
    });

    expect(screen.getByText("Added to cart.")).toBeInTheDocument();
  });
});
