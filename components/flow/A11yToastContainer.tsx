"use client";

import * as React from "react";
import { useToastStore } from "@/store/useToastStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";
import { Check, Bell, Trash2, ShoppingBag, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastItem } from "@/lib/types";

function getToastVisual(toast: ToastItem) {
  if (toast.kind === "error") {
    return {
      icon: <TriangleAlert className="h-4 w-4 stroke-[2.5] text-[#FF4D4D]" />,
    };
  }
  switch (toast.variant) {
    case "cart":
      return {
        icon: <ShoppingBag className="h-4 w-4 stroke-[2.5] text-primary" />,
      };
    case "staff-call":
      return {
        icon: <Bell className="h-4 w-4 stroke-[2.5] text-[#FFB020]" />,
      };
    case "delete":
      return {
        icon: <Trash2 className="h-4 w-4 stroke-[2.5] text-[#FF6B6B]" />,
      };
    case "generic":
    default:
      return {
        icon: <Check className="h-4 w-4 stroke-[3] text-primary" />,
      };
  }
}

export function A11yToastContainer() {
  const { t } = useTranslation("common");
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const timeoutExtension = useAccessibilityStore(
    (state) => state.timeoutExtension
  );
  const fontScale = useAccessibilityStore((state) => state.fontScale);

  const [isPaused, setIsPaused] = React.useState(false);
  const [bottomOffsetPx, setBottomOffsetPx] = React.useState<number | null>(null);

  // Dynamic clearance measurement: ensures the toast NEVER covers the bottom action bar
  // (StaffCallButton + CartSummaryPill, or StickyActionBar), adapting automatically
  // to font scale, viewport size, and safe area insets.
  React.useEffect(() => {
    const updateOffset = () => {
      const bottomActionsEl = document.getElementById("jumun-bottom-actions");
      const stickyActionBarEl = document.querySelector("[data-sticky-action-bar]");
      const targetEl = bottomActionsEl || stickyActionBarEl;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        // Distance from bottom of viewport to the TOP of the target action bar + 14px clearance margin
        const clearance = Math.max(0, window.innerHeight - rect.top + 14);
        setBottomOffsetPx(clearance);
      } else {
        setBottomOffsetPx(null);
      }
    };

    updateOffset();
    window.addEventListener("resize", updateOffset, { passive: true });
    window.addEventListener("scroll", updateOffset, { passive: true });

    const observer = new MutationObserver(updateOffset);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("scroll", updateOffset);
      observer.disconnect();
    };
  }, [fontScale, toasts.length]);

  // Current active toast
  const currentToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  // Auto-dismiss timer logic: pause on hover / hold
  React.useEffect(() => {
    if (!currentToast || isPaused) return;

    const duration = timeoutExtension ? 7000 : 3200;
    const timer = setTimeout(() => {
      dismissToast(currentToast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentToast, dismissToast, timeoutExtension, isPaused]);

  return (
    <div
      style={{
        bottom:
          bottomOffsetPx !== null && bottomOffsetPx > 0
            ? `${bottomOffsetPx}px`
            : "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
      }}
      className="fixed left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none px-4 w-full max-w-[840px] transition-[bottom] duration-200 ease-out"
      role="region"
      aria-label={t("toastAlertAria")}
      aria-live="off"
    >
      {/* 
        CRITICAL: AnimatePresence must ALWAYS remain mounted.
        Do NOT early-return null from the component, or AnimatePresence is torn down
        synchronously before the exit animation can run!
      */}
      <AnimatePresence mode="popLayout">
        {currentToast && (
          <motion.div
            key={currentToast.id}
            layout
            initial={
              reducedMotion
                ? false
                : { scale: 0, opacity: 0 }
            }
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { scale: 0, opacity: 0 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 420,
                    damping: 22,
                    mass: 0.8,
                  }
            }
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.2, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.y) > 20 || Math.abs(info.velocity.y) > 200) {
                dismissToast(currentToast.id);
              }
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-[#191F28] px-4.5 py-2.5 text-white shadow-[0_12px_32px_rgba(25,31,40,0.25)] border border-white/10 cursor-grab active:cursor-grabbing select-none"
            )}
          >
            {/* Subtle Accent Icon */}
            <div className="shrink-0 flex items-center justify-center" aria-hidden="true">
              {getToastVisual(currentToast).icon}
            </div>

            {/* Toast Message Text */}
            <span className="text-base font-semibold text-white/95 leading-none">
              {currentToast.messageKo}
            </span>

            {/* Optional Inline Undo Action */}
            {currentToast.onUndo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  currentToast.onUndo?.();
                  dismissToast(currentToast.id);
                }}
                className="ml-1 shrink-0 min-h-[32px] px-2 flex items-center justify-center rounded-[8px] text-base font-bold text-primary hover:text-primary/80 transition-colors focus-visible:underline"
                aria-label={t("undoAria")}
              >
                {t("undo")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
