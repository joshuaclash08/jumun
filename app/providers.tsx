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

  useEffect(() => {
    hydrateReducedMotionFromSystem(osPrefersReducedMotion);
  }, [osPrefersReducedMotion, hydrateReducedMotionFromSystem]);

  return children;
}
