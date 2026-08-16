"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

interface DigitColumnProps {
  digit: number;
  placeIndex: number;
  reduceMotion: boolean;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DigitColumn({ digit, placeIndex, reduceMotion }: DigitColumnProps) {
  return (
    <span className="relative inline-flex h-[1.25em] w-[0.6em] overflow-hidden justify-center items-start leading-[1.25em] align-baseline">
      <motion.span
        className="flex flex-col items-center select-none will-change-transform"
        initial={false}
        animate={{ y: `-${digit * 10}%` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 340,
                damping: 24,
                mass: 0.5,
                delay: placeIndex * 0.015,
              }
        }
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex h-[1.25em] items-center justify-center tabular-nums leading-[1.25em]"
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export interface RollingPriceProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Fluid Slot-Machine / Odometer Rolling Price Counter.
 * Each numeric column animates independently using spring physics.
 * Screen-reader accessible and respects reduced motion settings.
 */
export function RollingPrice({
  value,
  suffix = "원",
  prefix,
  className,
  ariaLabel,
}: RollingPriceProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const formatted = value.toLocaleString("ko-KR");
  const fullLabel = `${prefix ? prefix + " " : ""}${formatted}${suffix ? suffix : ""}`;

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums font-inherit tracking-normal",
        className
      )}
      aria-label={ariaLabel || fullLabel}
    >
      {/* Screen reader only full accessible text */}
      <span className="sr-only">{fullLabel}</span>

      {/* Visual Slot Machine Rolling Digits */}
      <span className="inline-flex items-baseline" aria-hidden="true">
        {prefix && <span className="mr-1">{prefix}</span>}
        <span className="inline-flex items-baseline">
          {formatted.split("").map((char, i) => {
            const isDigit = !isNaN(parseInt(char, 10));
            if (isDigit) {
              const digitVal = parseInt(char, 10);
              const placeFromRight = formatted.length - 1 - i;
              return (
                <DigitColumn
                  key={`digit-col-${placeFromRight}`}
                  digit={digitVal}
                  placeIndex={placeFromRight}
                  reduceMotion={reduceMotion}
                />
              );
            }
            return (
              <span key={`char-${i}`} className="inline-block">
                {char}
              </span>
            );
          })}
        </span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </span>
    </span>
  );
}
