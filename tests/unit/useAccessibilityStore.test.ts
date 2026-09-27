import { describe, expect, it, beforeEach } from "vitest";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { DEFAULT_ACCESSIBILITY_SETTINGS } from "@/lib/types";

describe("useAccessibilityStore", () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      hasSetTheme: false,
      hasSetReducedMotion: false,
    });
  });

  it("initializes with default accessibility settings", () => {
    const state = useAccessibilityStore.getState();
    expect(state.theme).toBe("light");
    expect(state.highContrast).toBe(false);
    expect(state.fontScale).toBe(1);
    expect(state.reducedMotion).toBe(false);
    expect(state.dyslexiaSpacing).toBe(false);
    expect(state.hapticsEnabled).toBe(true);
    expect(state.language).toBe("ko");
  });

  it("updates individual accessibility preferences", () => {
    useAccessibilityStore.getState().setTheme("dark");
    expect(useAccessibilityStore.getState().theme).toBe("dark");

    useAccessibilityStore.getState().setHighContrast(true);
    expect(useAccessibilityStore.getState().highContrast).toBe(true);

    useAccessibilityStore.getState().setFontScale(1.3);
    expect(useAccessibilityStore.getState().fontScale).toBe(1.3);

    useAccessibilityStore.getState().setDyslexiaSpacing(true);
    expect(useAccessibilityStore.getState().dyslexiaSpacing).toBe(true);

    useAccessibilityStore.getState().setHapticsEnabled(false);
    expect(useAccessibilityStore.getState().hapticsEnabled).toBe(false);

    useAccessibilityStore.getState().setLanguage("en");
    expect(useAccessibilityStore.getState().language).toBe("en");
  });

  it("hydrates theme from system preference only on first visit and preserves user manual choice", () => {
    // 1. Initial state has default bright mode ('light') and hasSetTheme is false
    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(false);

    // 2. First visit on a device with OS dark mode enabled -> hydrated to 'dark'
    useAccessibilityStore.getState().hydrateThemeFromSystem(true);
    expect(useAccessibilityStore.getState().theme).toBe("dark");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(true);

    // 3. Subsequent visits / OS preference changes do NOT overwrite the saved theme
    useAccessibilityStore.getState().hydrateThemeFromSystem(false);
    expect(useAccessibilityStore.getState().theme).toBe("dark");

    // 4. User can explicitly change to 'light' in settings
    useAccessibilityStore.getState().setTheme("light");
    expect(useAccessibilityStore.getState().theme).toBe("light");

    // 5. Subsequent system queries still do NOT overwrite user's explicit preference
    useAccessibilityStore.getState().hydrateThemeFromSystem(true);
    expect(useAccessibilityStore.getState().theme).toBe("light");
  });

  it("hydrates theme from system preference as light if OS is light mode on first visit", () => {
    useAccessibilityStore.getState().hydrateThemeFromSystem(false);
    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(true);

    // After that, OS changes to dark mode do not overwrite
    useAccessibilityStore.getState().hydrateThemeFromSystem(true);
    expect(useAccessibilityStore.getState().theme).toBe("light");
  });

  it("hydrates reduced motion from system preference only on first visit", () => {
    // First hydration from system (prefersReducedMotion: true)
    useAccessibilityStore.getState().hydrateReducedMotionFromSystem(true);
    expect(useAccessibilityStore.getState().reducedMotion).toBe(true);
    expect(useAccessibilityStore.getState().hasSetReducedMotion).toBe(true);

    // Subsequent system changes should not overwrite user preference
    useAccessibilityStore.getState().hydrateReducedMotionFromSystem(false);
    expect(useAccessibilityStore.getState().reducedMotion).toBe(true);

    // User can still explicitly override it
    useAccessibilityStore.getState().setReducedMotion(false);
    expect(useAccessibilityStore.getState().reducedMotion).toBe(false);
  });

  it("applies accessibility presets and resets all correctly", () => {
    useAccessibilityStore.getState().setTheme("dark");
    useAccessibilityStore.getState().applyPreset("visual");
    expect(useAccessibilityStore.getState().highContrast).toBe(true);
    expect(useAccessibilityStore.getState().fontScale).toBe(1.3);
    expect(useAccessibilityStore.getState().timeoutExtension).toBe(true);

    useAccessibilityStore.getState().applyPreset("reading");
    expect(useAccessibilityStore.getState().dyslexiaSpacing).toBe(true);
    expect(useAccessibilityStore.getState().reducedMotion).toBe(true);

    useAccessibilityStore.getState().resetAll();
    expect(useAccessibilityStore.getState().theme).toBe("light");
    expect(useAccessibilityStore.getState().hasSetTheme).toBe(false);
    expect(useAccessibilityStore.getState().hasSetReducedMotion).toBe(false);
    expect(useAccessibilityStore.getState().highContrast).toBe(false);
    expect(useAccessibilityStore.getState().fontScale).toBe(1);
    expect(useAccessibilityStore.getState().dyslexiaSpacing).toBe(false);
  });
});
