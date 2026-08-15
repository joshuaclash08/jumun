"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface CartSummaryPillProps {
  onClick: () => void;
  className?: string;
}

export function CartSummaryPill({ onClick, className }: CartSummaryPillProps) {
  const items = useCartStore((state) => state.items);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  if (totalQuantity === 0) {
    return null;
  }

  const ariaLabel = `장바구니에 ${totalQuantity}개의 상품이 담겨있습니다. 총 결제 금액은 ${totalPrice.toLocaleString("ko-KR")}원입니다. 결제하기 위해 버튼을 눌러주세요.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className={cn(
          "fixed bottom-[env(safe-area-inset-bottom)] left-4 right-4 z-50 mb-4",
          className
        )}
      >
        <button
          onClick={onClick}
          aria-label={ariaLabel}
          className="flex h-16 w-full items-center justify-between rounded-full bg-primary px-6 text-primary-foreground shadow-[0_12px_32px_rgba(33,30,26,0.16),_0_4px_8px_rgba(33,30,26,0.08)] outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-bold">
              {totalQuantity}
            </span>
            <span className="font-semibold">결제하기</span>
          </div>
          <span className="text-lg font-bold">
            {totalPrice.toLocaleString("ko-KR")}원
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
