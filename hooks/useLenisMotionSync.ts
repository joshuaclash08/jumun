"use client";

import { useAccessibilityStore } from "@/store/useAccessibilityStore";

// Whether <ReactLenis> (lenis/react) should be mounted at all. Lenis has its own
// OS-level prefers-reduced-motion check built in, but it isn't sufficient here:
// useAccessibilityStore.reducedMotion is this app's single source of truth,
// seeded from the OS preference but independently overridable in settings.
// See docs/tech-stack.md's Lenis caveat.
export function useLenisMotionSync(): boolean {
  return !useAccessibilityStore((state) => state.reducedMotion);
}
