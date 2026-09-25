"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type AppLanguage,
  type OneHandedMode,
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
  setOneHandedMode: (oneHandedMode: OneHandedMode) => void;
  setVoiceGuideEnabled: (voiceGuideEnabled: boolean) => void;
  applyPreset: (preset: "visual" | "hearing" | "reading" | "senior") => void;
  resetAll: () => void;
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
      setOneHandedMode: (oneHandedMode) => set({ oneHandedMode }),
      setVoiceGuideEnabled: (voiceGuideEnabled) => set({ voiceGuideEnabled }),
      applyPreset: (preset) => {
        switch (preset) {
          case "visual":
            set({
              highContrast: true,
              fontScale: 1.3,
              hapticsEnabled: true,
              timeoutExtension: true,
            });
            break;
          case "hearing":
            set({
              hapticsEnabled: true,
              timeoutExtension: true,
            });
            break;
          case "reading":
            set({
              dyslexiaSpacing: true,
              reducedMotion: true,
              hasSetReducedMotion: true,
            });
            break;
          case "senior":
            set({
              fontScale: 1.3,
              highContrast: false,
              hapticsEnabled: true,
              timeoutExtension: true,
            });
            break;
        }
      },
      resetAll: () =>
        set({
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
        }),
    }),
    { name: "jumun:accessibility-settings" },
  ),
);
