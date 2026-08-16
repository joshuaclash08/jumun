"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { ShoppingBag } from "lucide-react";
import { RollingPrice } from "@/components/ui/RollingPrice";

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
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: reduceMotion ? 0 : undefined,
        }}
        className={cn(
          "fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-22 right-4 max-w-[656px] z-50",
          className
        )}
      >
        <Button
          size="cta"
          onClick={onClick}
          aria-label={ariaLabel}
          className="flex h-16 w-full items-center justify-between rounded-full bg-primary px-6 text-primary-foreground shadow-floating hover:bg-primary/95 transition-all border-none"
        >
          <div className="flex w-full items-center justify-between pointer-events-none" aria-hidden="true">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white/20 text-white font-black px-2 text-base">
                <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                {totalQuantity}
              </div>
              <span className="font-extrabold text-base">주문하기</span>
            </div>
            <RollingPrice
              value={totalPrice}
              suffix="원"
              className="text-xl font-black"
            />
          </div>
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
