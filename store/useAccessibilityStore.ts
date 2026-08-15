"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type AppLanguage,
} from "@/lib/types";

interface AccessibilityStore extends AccessibilitySettings {
  hasSetReducedMotion: boolean;
  hydrateReducedMotionFromSystem: (prefersReducedMotion: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontScale: (fontScale: number) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setDyslexiaSpacing: (dyslexiaSpacing: boolean) => void;
  setHapticsEnabled: (hapticsEnabled: boolean) => void;
  setTimeoutExtension: (timeoutExtension: boolean) => void;
}

// Settings only, never a raw disability profile (docs/architecture.md).
// Persists under one global key, not scoped per store/table -- accessibility
// settings follow the person across every venue, confirmed in PRODUCT.md.
export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      hasSetReducedMotion: false,

      // No-ops for a returning device (hasSetReducedMotion already true from a
      // prior explicit or system-seeded value) -- only applies on a genuinely
      // first-ever visit. Call once from the root layout.
      hydrateReducedMotionFromSystem: (prefersReducedMotion) => {
        if (get().hasSetReducedMotion) return;
        set({ reducedMotion: prefersReducedMotion, hasSetReducedMotion: true });
      },

      setLanguage: (language) => set({ language }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setFontScale: (fontScale) => set({ fontScale }),
      setReducedMotion: (reducedMotion) =>
        set({ reducedMotion, hasSetReducedMotion: true }),
      setDyslexiaSpacing: (dyslexiaSpacing) => set({ dyslexiaSpacing }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setTimeoutExtension: (timeoutExtension) => set({ timeoutExtension }),
    }),
    { name: "jumun:accessibility-settings" },
  ),
);
