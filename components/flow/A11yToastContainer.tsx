"use client";

import * as React from "react";
import { useToastStore } from "@/store/useToastStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
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
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const timeoutExtension = useAccessibilityStore(
    (state) => state.timeoutExtension
  );

  // Auto-dismiss logic
  React.useEffect(() => {
    if (toasts.length === 0) return;

    const currentToast = toasts[toasts.length - 1];
    const duration = timeoutExtension ? 7000 : 3200;

    const timer = setTimeout(() => {
      dismissToast(currentToast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toasts, dismissToast, timeoutExtension]);

  if (toasts.length === 0) return null;

  const currentToast = toasts[toasts.length - 1];
  const { icon } = getToastVisual(currentToast);

  return (
    <div
      className="fixed top-[calc(env(safe-area-inset-top,0px)+1rem)] left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none px-4 w-full max-w-[768px]"
      role="region"
      aria-label="알림 메시지"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentToast.id}
          initial={{ y: -20, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -16, opacity: 0, scale: 0.94 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 32,
            duration: reducedMotion ? 0 : undefined,
          }}
          className={cn(
            "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-[#191F28]/95 px-4.5 py-2.5 text-white shadow-[0_10px_28px_rgba(25,31,40,0.22)] border border-white/10"
          )}
        >
          {/* Subtle Accent Icon */}
          <div className="shrink-0 flex items-center justify-center" aria-hidden="true">
            {icon}
          </div>

          {/* Toast Message Text */}
          <span className="text-base font-semibold text-white/95 leading-none">
            {currentToast.messageKo}
          </span>

          {/* Optional Inline Undo Action */}
          {currentToast.onUndo && (
            <button
              type="button"
              onClick={() => {
                currentToast.onUndo?.();
                dismissToast(currentToast.id);
              }}
              className="ml-1 shrink-0 text-base font-bold text-primary hover:text-primary/80 transition-colors focus-visible:underline"
              aria-label="방금 실행한 작업 취소"
            >
              취소
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
