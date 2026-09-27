"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { ShoppingBag } from "lucide-react";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface CartSummaryPillProps {
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
}

export function CartSummaryPill({
  onClick,
  className,
  showLabel = true,
  buttonRef,
}: CartSummaryPillProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  const items = useCartStore((state) => state.items);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const ariaLabel = t("cart.summaryAria", { count: totalQuantity, total: formatKRW(totalPrice) });

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
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn("pointer-events-auto flex-1 min-w-0", className)}
        >
          <Button
            ref={buttonRef}
            id="cart-summary-pill-button"
            size="lg"
            onClick={onClick}
            aria-label={ariaLabel}
            className="flex h-14 min-h-[56px] w-full items-center justify-between rounded-full bg-primary px-4 sm:px-5 text-primary-foreground shadow-[0_4px_20px_rgba(0,100,255,0.28)] hover:bg-primary/95 active:scale-[0.96] transition-all border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <div
              className="flex w-full items-center justify-between pointer-events-none min-w-0"
              aria-hidden="true"
            >
              <div className="flex items-center min-w-0 shrink gap-2.5">
                {/* Visual Reward: Crisp circular shopping bag icon with count badge */}
                <motion.div
                  key={`cart-badge-${totalQuantity}`}
                  initial={reduceMotion ? false : { scale: 0.6, y: -2 }}
                  animate={{ scale: [0.6, 1.25, 0.95, 1], y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.32,
                    ease: "easeOut",
                  }}
                  className="relative flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/25 text-white shrink-0 shadow-xs"
                >
                  <ShoppingBag className="size-4 sm:size-4.5 stroke-[2.4]" />
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-white text-primary font-black text-[11px] leading-none shadow-xs">
                    {totalQuantity}
                  </span>
                </motion.div>
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
                  <span className="block font-extrabold text-base tracking-tight whitespace-nowrap pl-0.5">
                    {t("cart.order")}
                  </span>
                </motion.div>
              </div>
              <RollingPrice
                value={totalPrice}
                suffix={tCommon("currency")}
                className="text-base sm:text-lg md:text-xl font-black tabular-nums whitespace-nowrap shrink-0 ml-2"
              />
            </div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
