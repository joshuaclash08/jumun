"use client";

import { useEffect, type ReactNode } from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useOSReducedMotionPreference } from "@/hooks/useReducedMotion";
import { useOSDarkModePreference } from "@/hooks/useOSDarkModePreference";
import { SetupGuard } from "@/components/flow/SetupGuard";

// Seeds reducedMotion & theme from the OS preference once, on a device's genuinely
// first visit only -- useAccessibilityStore hydrates are no-ops once set
// or manually chosen by the user (see store/useAccessibilityStore.ts).
export function Providers({ children }: { children: ReactNode }) {
  const osPrefersReducedMotion = useOSReducedMotionPreference();
  const osPrefersDark = useOSDarkModePreference();
  const hydrateReducedMotionFromSystem = useAccessibilityStore(
    (state) => state.hydrateReducedMotionFromSystem,
  );
  const hydrateThemeFromSystem = useAccessibilityStore(
    (state) => state.hydrateThemeFromSystem,
  );
  const theme = useAccessibilityStore((state) => state.theme);
  const hasSetTheme = useAccessibilityStore((state) => state.hasSetTheme);
  const highContrast = useAccessibilityStore((state) => state.highContrast);
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const dyslexiaSpacing = useAccessibilityStore((state) => state.dyslexiaSpacing);
  const language = useAccessibilityStore((state) => state.language);

  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : osPrefersReducedMotion;
    hydrateReducedMotionFromSystem(isReduced);
  }, [osPrefersReducedMotion, hydrateReducedMotionFromSystem]);

  useEffect(() => {
    // Read genuine live client media query to prevent getServerSnapshot (false)
    // from poisoning the initial theme hydration on first visit!
    const isDark =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : osPrefersDark;
    hydrateThemeFromSystem(isDark);
  }, [osPrefersDark, hydrateThemeFromSystem]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (hasSetTheme) {
      root.classList.remove("dark");
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#17171c" : "#ffffff",
      );
    }
  }, [theme, hasSetTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    if (dyslexiaSpacing) {
      root.classList.add("dyslexia-spacing");
    } else {
      root.classList.remove("dyslexia-spacing");
    }
  }, [dyslexiaSpacing]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontScale && fontScale !== 1) {
      root.style.fontSize = `${fontScale * 100}%`;
    } else {
      root.style.fontSize = "";
    }
  }, [fontScale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language || "ko";
    }
  }, [language]);

  // Native 120Hz/60Hz compositor momentum scrolling is preserved for zero input lag and optimal performance.
  return <SetupGuard>{children}</SetupGuard>;
}
