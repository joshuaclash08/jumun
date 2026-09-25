"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string | number> {
  /** Accessible name for the radiogroup, e.g. "글자 크기 선택". */
  groupLabel: string;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Builds the success toast message from the newly-selected option's label. */
  getSuccessMessage: (label: string) => string;
}

/**
 * Shared segmented-control UI used by settings screens for small, closed-set
 * choices (font scale, language, ...). Selecting an option updates the value
 * and fires a success toast/announcement via A11yFeedbackService.
 */
export function SegmentedControl<T extends string | number>({
  groupLabel,
  options,
  value,
  onChange,
  getSuccessMessage,
}: SegmentedControlProps<T>) {
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  return (
    <div
      role="radiogroup"
      aria-label={groupLabel}
      className={cn(
        "grid gap-2 pt-1 bg-muted/40 p-1.5 rounded-[16px]",
        options.length === 3 ? "grid-cols-3" : "grid-cols-2",
      )}
    >
      {options.map((item) => {
        const isSelected = value === item.value;
        return (
          <motion.button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            onClick={() => {
              onChange(item.value);
              toast({
                kind: "success",
                messageKo: getSuccessMessage(item.label),
                variant: "generic",
                hapticsEnabled,
              });
            }}
            className={cn(
              "flex h-11 items-center justify-center rounded-[12px] font-bold text-base transition-all outline-none cursor-pointer",
              isSelected
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            {item.label}
          </motion.button>
        );
      })}
    </div>
  );
}
