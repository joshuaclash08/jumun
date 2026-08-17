"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

export const FONT_SCALES = [
  { scale: 1.0, label: "보통" },
  { scale: 1.15, label: "크게" },
  { scale: 1.3, label: "아주 크게" },
];

/**
 * Segmented Control for Global Font Scale Selection in Settings.
 */
export function FontScaleSelector() {
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const setFontScale = useAccessibilityStore((state) => state.setFontScale);
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          글자 크기
        </span>
        <span className="text-base font-medium text-muted-foreground">
          화면 전체 기본 글꼴 크기를 조절해요
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label="글자 크기 선택"
        className="grid grid-cols-3 gap-2 pt-1 bg-muted/40 p-1.5 rounded-[16px]"
      >
        {FONT_SCALES.map((item) => {
          const isSelected = fontScale === item.scale;
          return (
            <motion.button
              key={item.scale}
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
                setFontScale(item.scale);
                notify(
                  "success",
                  `글자 크기가 ${item.label}로 변경되었습니다.`,
                  {
                    hapticsEnabled,
                  },
                );
              }}
              className={cn(
                "flex h-11 items-center justify-center rounded-[12px] font-bold text-base transition-all cursor-pointer",
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
    </div>
  );
}
