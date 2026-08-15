import { vibrate, HAPTIC_PATTERNS } from "@/hooks/useHaptics";
import type { ToastItem } from "@/lib/types";

const LIVE_REGION_ID = "jumun-live-region";

function getLiveRegion(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(LIVE_REGION_ID);
}

// Drives the app-shell live region (docs/architecture.md's app shell renders the
// element with id="jumun-live-region"). Priority "assertive" is for failures and
// other time-sensitive announcements; "polite" for routine state changes.
export function announce(messageKo: string, priority: "polite" | "assertive" = "polite"): void {
  const region = getLiveRegion();
  if (!region) return;
  region.setAttribute("aria-live", priority);
  region.textContent = messageKo;
}

// Fan-out for a cart/order state change: live-region announcement (always) +
// haptic pulse (only if the caller confirms haptics are enabled in settings --
// this service doesn't read the accessibility store itself, to keep it a plain
// function callable from store actions without a circular import).
export function notify(
  kind: "success" | "error",
  messageKo: string,
  options: { hapticsEnabled?: boolean; onUndo?: () => void } = {},
): ToastItem {
  announce(messageKo, kind === "error" ? "assertive" : "polite");
  if (options.hapticsEnabled) {
    vibrate(kind === "success" ? HAPTIC_PATTERNS.success : HAPTIC_PATTERNS.error);
  }
  return {
    id: crypto.randomUUID(),
    messageKo,
    kind,
    onUndo: options.onUndo,
  };
}
