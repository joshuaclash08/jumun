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
  showLabel?: boolean;
}

export function CartSummaryPill({ onClick, className, showLabel = true }: CartSummaryPillProps) {
  const items = useCartStore((state) => state.items);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const ariaLabel = `장바구니에 ${totalQuantity}개의 상품이 담겨있습니다. 총 결제 금액은 ${totalPrice.toLocaleString("ko-KR")}원입니다. 결제하기 위해 버튼을 눌러주세요.`;

  // The component itself always renders -- AnimatePresence needs the pill to
  // be a keyed child that mounts/unmounts via this condition (not the whole
  // component returning null) or it can't run the exit animation: a parent
  // render returning null tears AnimatePresence down synchronously along with
  // everything inside it, before it gets a chance to animate anything out.
  return (
    <AnimatePresence>
      {totalQuantity > 0 && (
        <motion.div
          key="cart-summary-pill"
          initial={reduceMotion ? false : { y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 50, opacity: 0 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn("pointer-events-auto flex-1 min-w-0", className)}
        >
          <Button
            size="lg"
            onClick={onClick}
            aria-label={ariaLabel}
            className="flex h-14 min-h-[56px] w-full items-center justify-between rounded-full bg-primary px-4 sm:px-5 text-primary-foreground shadow-[0_4px_20px_rgba(0,100,255,0.28)] hover:bg-primary/95 transition-colors border-none"
          >
            <div
              className="flex w-full items-center justify-between pointer-events-none min-w-0"
              aria-hidden="true"
            >
              <div className="flex items-center min-w-0 shrink">
                <div className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 text-white font-black px-2 sm:px-2.5 text-sm shrink-0">
                  <ShoppingBag className="size-4 mr-1 stroke-[2.2]" />
                  {totalQuantity}
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    width: showLabel ? "auto" : 0,
                    opacity: showLabel ? 1 : 0,
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="overflow-hidden"
                  aria-hidden={!showLabel}
                >
                  <span className="block font-extrabold text-[15px] sm:text-base tracking-tight whitespace-nowrap pl-1.5 sm:pl-2">
                    주문하기
                  </span>
                </motion.div>
              </div>
              <RollingPrice
                value={totalPrice}
                suffix="원"
                className="text-base sm:text-lg md:text-xl font-black tabular-nums whitespace-nowrap shrink-0 ml-2"
              />
            </div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
