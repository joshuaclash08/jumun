"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  /** Current quantity value */
  value: number;
  /** Callback triggered when increment (+) button is pressed */
  onIncrement: () => void;
  /** Callback triggered when decrement (-) button is pressed */
  onDecrement: () => void;
  /** Minimum selectable value (default: 1) */
  min?: number;
  /** Maximum selectable value (default: 99) */
  max?: number;
  /** Size variant: "sm" for compact lists (e.g., cart drawer), "md" for detailed views (e.g., product sheet) */
  size?: "sm" | "md";
  /** Descriptive name of the item for screen reader announcement */
  itemLabel?: string;
  /** Additional container CSS class names */
  className?: string;
}

/**
 * Reusable Quantity Stepper Component ([-] quantity [+]).
 * Features accessible ARIA live region, haptic-friendly press scale, and disabled state styling.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = "md",
  itemLabel = "주문",
  className,
}: QuantityStepperProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const isSm = size === "sm";
  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div
      role="group"
      aria-label={`${itemLabel} 수량 조절`}
      className={cn(
        "flex items-center rounded-full bg-muted/60 p-1 border border-border/50 shadow-2xs",
        isSm ? "h-9.5 gap-0.5" : "h-11 gap-1",
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={reduceMotion || isMin ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onDecrement}
        disabled={isMin}
        className={cn(
          "flex items-center justify-center rounded-full text-foreground hover:bg-background disabled:opacity-30 transition-colors",
          isSm ? "h-8 w-8" : "h-9 w-9"
        )}
        aria-label={`${itemLabel} 수량 1개 줄이기`}
      >
        <Minus className={cn("stroke-[2.5]", isSm ? "h-3.5 w-3.5" : "h-4 w-4")} />
      </motion.button>

      <span
        className={cn(
          "flex justify-center font-extrabold text-foreground tabular-nums tracking-[0.6px]",
          isSm ? "w-7 text-base" : "w-9 text-base"
        )}
        aria-live="polite"
        aria-label={`현재 수량 ${value}개`}
      >
        {value}
      </span>

      <motion.button
        type="button"
        whileTap={reduceMotion || isMax ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onIncrement}
        disabled={isMax}
        className={cn(
          "flex items-center justify-center rounded-full text-foreground hover:bg-background disabled:opacity-30 transition-colors",
          isSm ? "h-8 w-8" : "h-9 w-9"
        )}
        aria-label={`${itemLabel} 수량 1개 늘리기`}
      >
        <Plus className={cn("stroke-[2.5]", isSm ? "h-3.5 w-3.5" : "h-4 w-4")} />
      </motion.button>
    </div>
  );
}
