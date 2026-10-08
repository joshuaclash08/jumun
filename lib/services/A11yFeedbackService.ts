import { vibrate, HAPTIC_PATTERNS } from "@/hooks/useHaptics";
import { generateUUID } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

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

export interface ToastInput {
  kind: "success" | "error";
  messageKo: string;
  messageEn?: string;
  variant?: "cart" | "staff-call" | "delete" | "generic";
  hapticsEnabled?: boolean;
  onUndo?: () => void;
}

// Full fan-out for a user-facing state change: live-region announcement +
// haptic pulse (only if the caller confirms haptics are enabled in settings
// -- this service doesn't read the accessibility store itself, to keep it a
// plain function callable from store actions without a circular import) +
// pushing a visual toast into useToastStore. Unlike the old notify(), this
// never asks the caller to remember to push the toast themselves.
export function toast(input: ToastInput): void {
  const { kind, messageKo, messageEn, variant = "generic", hapticsEnabled, onUndo } = input;

  const isEn = typeof document !== "undefined" && document.documentElement.lang === "en";
  const textToAnnounce = isEn && messageEn ? messageEn : messageKo;

  announce(textToAnnounce, kind === "error" ? "assertive" : "polite");

  if (hapticsEnabled) {
    vibrate(kind === "success" ? HAPTIC_PATTERNS.success : HAPTIC_PATTERNS.error);
  }

  useToastStore.getState().pushToast({
    id: generateUUID(),
    messageKo,
    messageEn,
    kind,
    variant,
    onUndo,
  });
}

// Deprecated: kept only so un-migrated callers (see AGENTS.md-style handoff
// notes) keep compiling and now get real visual toasts immediately. New code
// should call toast()/announce() directly. Remove once no callers remain.
export function notify(
  kind: "success" | "error",
  messageKo: string,
  options: { hapticsEnabled?: boolean; onUndo?: () => void } = {},
): void {
  toast({ kind, messageKo, variant: "generic", ...options });
}
