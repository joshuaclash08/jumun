import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useOSDarkModePreference } from "@/hooks/useOSDarkModePreference";
import { Providers } from "@/app/providers";
import { DEFAULT_ACCESSIBILITY_SETTINGS } from "@/lib/types";

// Mock next/navigation for SetupGuard inside Providers
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

describe("Theme System & ThemeModeSelector", () => {
  let listeners: ((e: MediaQueryListEvent) => void)[] = [];
  let matchesMock = false;

  beforeEach(() => {
    listeners = [];
    matchesMock = false;

    // Reset store
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      theme: "light",
      hasSetTheme: false,
    });

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-color-scheme: dark") ? matchesMock : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === "change") listeners.push(callback);
        }),
        removeEventListener: vi.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          if (event === "change") {
            listeners = listeners.filter((l) => l !== callback);
          }
        }),
        dispatchEvent: vi.fn(),
      })),
    });

    document.documentElement.className = "";
  });

  afterEach(() => {
    document.documentElement.className = "";
  });

  it("renders ThemeModeSelector with bright and dark mode options", () => {
    render(<ThemeModeSelector />);

    expect(screen.getByText("화면 테마")).toBeInTheDocument();
    expect(
      screen.getByText("기본 밝은 모드와 눈이 편안한 다크 모드를 선택해요")
    ).toBeInTheDocument();

    const brightButton = screen.getByRole("radio", { name: /밝은 모드/i });
    const darkButton = screen.getByRole("radio", { name: /다크 모드/i });

    expect(brightButton).toBeInTheDocument();
    expect(darkButton).toBeInTheDocument();
    expect(brightButton).toHaveAttribute("aria-checked", "true");
    expect(darkButton).toHaveAttribute("aria-checked", "false");
  });

  it("switches theme and marks hasSetTheme when user clicks dark mode", () => {
    render(<ThemeModeSelector />);

    const darkButton = screen.getByRole("radio", { name: /다크 모드/i });
    fireEvent.click(darkButton);

    expect(useAccessibilityStore.getState().theme).toBe("dark");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(true);
    expect(darkButton).toHaveAttribute("aria-checked", "true");

    const brightButton = screen.getByRole("radio", { name: /밝은 모드/i });
    fireEvent.click(brightButton);

    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(true);
    expect(brightButton).toHaveAttribute("aria-checked", "true");
  });

  it("passes axe accessibility checks on ThemeModeSelector", async () => {
    const { container } = render(<ThemeModeSelector />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("detects OS dark mode preference via useOSDarkModePreference", () => {
    matchesMock = true;
    const { result } = renderHook(() => useOSDarkModePreference());
    expect(result.current).toBe(true);
  });

  it("hydrates dark mode in Providers on first visit when OS preference is dark", () => {
    matchesMock = true;

    // User is on first visit: hasSetTheme is false
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(false);

    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    // Should have seeded theme from system
    expect(useAccessibilityStore.getState().theme).toBe("dark");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("retains user manual theme choice even when OS media query changes or on next visits", () => {
    // 1. Initial hydration from system: OS is dark
    matchesMock = true;
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );
    expect(useAccessibilityStore.getState().theme).toBe("dark");

    // 2. User manually switches to light mode in settings
    act(() => {
      useAccessibilityStore.getState().setTheme("light");
    });
    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // 3. System tries to re-hydrate (e.g., page reload or OS media query update)
    act(() => {
      useAccessibilityStore.getState().hydrateThemeFromSystem(true);
    });

    // 4. Must NOT overwrite user's manual choice!
    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
