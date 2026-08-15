"use client";

import { useEffect, type ReactNode } from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useOSReducedMotionPreference } from "@/hooks/useReducedMotion";

// Seeds reducedMotion from the OS preference once, on a device's genuinely
// first visit only -- useAccessibilityStore.hydrateReducedMotionFromSystem
// is itself a no-op once a value has ever been set (see store/useAccessibilityStore.ts).
export function Providers({ children }: { children: ReactNode }) {
  const osPrefersReducedMotion = useOSReducedMotionPreference();
  const hydrateReducedMotionFromSystem = useAccessibilityStore(
    (state) => state.hydrateReducedMotionFromSystem,
  );
  const highContrast = useAccessibilityStore((state) => state.highContrast);
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const dyslexiaSpacing = useAccessibilityStore((state) => state.dyslexiaSpacing);

  useEffect(() => {
    hydrateReducedMotionFromSystem(osPrefersReducedMotion);
  }, [osPrefersReducedMotion, hydrateReducedMotionFromSystem]);

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

  return children;
}
