"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: reduceMotion ? 0 : undefined,
        }}
        className={cn(
          "fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[736px] z-50 mb-4",
          className
        )}
      >
        <Button
          size="lg"
          onClick={onClick}
          aria-label={ariaLabel}
          className="flex h-16 w-full items-center justify-between rounded-full bg-primary px-6 text-primary-foreground shadow-[0_12px_32px_rgba(26,86,176,0.3)] hover:bg-primary/90"
        >
          <div className="flex items-center gap-2.5">
            <Badge
              variant="secondary"
              className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white/20 text-white font-extrabold px-2 text-sm border-none"
            >
              {totalQuantity}
            </Badge>
            <span className="font-bold text-base">결제하기</span>
          </div>
          <span className="text-xl font-extrabold">
            {totalPrice.toLocaleString("ko-KR")}원
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
