"use client";

import { useEffect, type ReactNode } from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useOSReducedMotionPreference } from "@/hooks/useReducedMotion";
import { SetupGuard } from "@/components/flow/SetupGuard";

export function Providers({ children }: { children: ReactNode }) {
  const osPrefersReducedMotion = useOSReducedMotionPreference();
  const hydrateReducedMotionFromSystem = useAccessibilityStore(
    (state) => state.hydrateReducedMotionFromSystem,
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
