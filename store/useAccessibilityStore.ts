"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type AppLanguage,
  type AppTheme,
  type OneHandedMode,
  type OrderMode,
} from "@/lib/types";

interface AccessibilityStore extends AccessibilitySettings {
  hasSetTheme: boolean;
  hydrateThemeFromSystem: (prefersDark?: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  hasSetReducedMotion: boolean;
  hydrateReducedMotionFromSystem: (prefersReducedMotion: boolean) => void;
  hasSetLanguage: boolean;
  hydrateLanguageFromSystem: (systemLanguage?: string) => void;
  setLanguage: (language: AppLanguage) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontScale: (fontScale: number) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setDyslexiaSpacing: (dyslexiaSpacing: boolean) => void;
  setHapticsEnabled: (hapticsEnabled: boolean) => void;
  setTimeoutExtension: (timeoutExtension: boolean) => void;
  setOneHandedMode: (oneHandedMode: OneHandedMode) => void;
  setVoiceGuideEnabled: (voiceGuideEnabled: boolean) => void;
  setOrderMode: (orderMode: OrderMode) => void;
  setMenuLayout: (menuLayout: import("@/lib/types").MenuLayout) => void;
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
      hasSetTheme: false,
      hasSetReducedMotion: false,
      hasSetLanguage: false,

      // Seeds theme from the OS preference once, during first-run /setup only.
      // Bright mode ('light') is the main default, but if the OS prefers dark
      // mode on initial visit, sets 'dark'. Once set or manually changed by user,
      // this is a no-op so returning visits keep user's saved preference.
      hydrateThemeFromSystem: (prefersDark?: boolean) => {
        if (get().hasSetTheme) return;
        const isDark =
          typeof prefersDark === "boolean"
            ? prefersDark
            : (typeof window !== "undefined" &&
               window.matchMedia?.("(prefers-color-scheme: dark)").matches) ?? false;
        set({ theme: isDark ? "dark" : "light", hasSetTheme: true });
      },

      setTheme: (theme) => set({ theme, hasSetTheme: true }),

      // No-ops for a returning device (hasSetReducedMotion already true from a
      // prior explicit or system-seeded value) -- only applies on a genuinely
      // first-ever visit. Call once from the root layout.
      hydrateReducedMotionFromSystem: (prefersReducedMotion) => {
        if (get().hasSetReducedMotion) return;
        set({ reducedMotion: prefersReducedMotion, hasSetReducedMotion: true });
      },

      // Seeds language from the OS/browser preference once, during first-run /setup only.
      // If the OS/browser language is English, sets 'en'; otherwise defaults to 'ko'.
      hydrateLanguageFromSystem: (systemLanguage?: string) => {
        if (get().hasSetLanguage) return;
        let isEn = false;
        if (typeof systemLanguage === "string") {
          isEn = /^en\b/i.test(systemLanguage);
        } else if (typeof navigator !== "undefined") {
          const langs = navigator.languages ?? [navigator.language];
          for (const l of langs) {
            if (typeof l === "string" && /^en\b/i.test(l)) {
              isEn = true;
              break;
            }
            if (typeof l === "string" && /^ko\b/i.test(l)) {
              isEn = false;
              break;
            }
          }
        }
        set({ language: isEn ? "en" : "ko", hasSetLanguage: true });
      },

      setLanguage: (language) => set({ language, hasSetLanguage: true }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setFontScale: (fontScale) => set({ fontScale }),
      setReducedMotion: (reducedMotion) =>
        set({ reducedMotion, hasSetReducedMotion: true }),
      setDyslexiaSpacing: (dyslexiaSpacing) => set({ dyslexiaSpacing }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setTimeoutExtension: (timeoutExtension) => set({ timeoutExtension }),
      setOneHandedMode: (oneHandedMode) => set({ oneHandedMode }),
      setVoiceGuideEnabled: (voiceGuideEnabled) => set({ voiceGuideEnabled }),
      setOrderMode: (orderMode) => set({ orderMode }),
      setMenuLayout: (menuLayout) => set({ menuLayout }),
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
          hasSetTheme: false,
          hasSetReducedMotion: false,
          hasSetLanguage: false,
        }),
    }),
    { name: "jumun:accessibility-settings" },
  ),
);
