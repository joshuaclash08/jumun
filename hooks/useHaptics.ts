// Phase 1 (web): navigator.vibrate() where supported (Android Chrome; unavailable on
// iOS Safari — see docs/tech-stack.md). Phase 2 (native) swaps this implementation for
// expo-haptics without touching any call site — see docs/architecture.md.

export const HAPTIC_PATTERNS = {
  success: 20,
  error: [40, 40, 40],
} as const;

export function vibrate(pattern: number | readonly number[]): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern as number | number[]);
}

export function useHaptics() {
  return { vibrate, patterns: HAPTIC_PATTERNS };
}
