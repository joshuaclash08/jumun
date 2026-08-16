"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function A11yToastContainer() {
  const toasts = useCartStore((state) => state.toasts);
  const dismissToast = useCartStore((state) => state.dismissToast);
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const timeoutExtension = useAccessibilityStore(
    (state) => state.timeoutExtension
  );

  // Auto-dismiss logic
  React.useEffect(() => {
    if (toasts.length === 0) return;

    const currentToast = toasts[toasts.length - 1];
    const duration = timeoutExtension ? 8000 : 4000;

    const timer = setTimeout(() => {
      dismissToast(currentToast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toasts, dismissToast, timeoutExtension]);

  if (toasts.length === 0) return null;

  const currentToast = toasts[toasts.length - 1];

  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[736px] z-50 flex justify-center pointer-events-none"
      role="region"
      aria-label="알림 메시지"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentToast.id}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-[--radius-lg] bg-foreground p-4 text-background shadow-[0_12px_32px_rgba(33,30,26,0.2)]"
          )}
        >
          <span className="text-base font-semibold">{currentToast.messageKo}</span>

          {currentToast.onUndo && (
            <motion.div
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  currentToast.onUndo?.();
                  dismissToast(currentToast.id);
                }}
                className="h-10 shrink-0 rounded-[--radius-md] bg-background/20 font-bold text-background hover:bg-background/30"
                aria-label="방금 실행한 작업 취소"
              >
                실행 취소
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
