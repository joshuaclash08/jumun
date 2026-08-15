import { describe, expect, it, beforeEach } from "vitest";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { DEFAULT_ACCESSIBILITY_SETTINGS } from "@/lib/types";

describe("useAccessibilityStore", () => {
  beforeEach(() => {
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      hasSetReducedMotion: false,
    });
  });

  it("initializes with default accessibility settings", () => {
    const state = useAccessibilityStore.getState();
    expect(state.highContrast).toBe(false);
    expect(state.fontScale).toBe(1);
    expect(state.reducedMotion).toBe(false);
    expect(state.dyslexiaSpacing).toBe(false);
    expect(state.hapticsEnabled).toBe(true);
    expect(state.language).toBe("ko");
  });

  it("updates individual accessibility preferences", () => {
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
});
