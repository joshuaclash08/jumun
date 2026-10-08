"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const FONT_SCALE_STEPS = [0.9, 1.0, 1.15, 1.3, 1.45] as const;
export type FontScaleStep = (typeof FONT_SCALE_STEPS)[number];

export const FONT_SCALE_CONFIG = [
  { scale: 0.9, key: "screen.fontScale.small" as const },
  { scale: 1.0, key: "screen.fontScale.normal" as const },
  { scale: 1.15, key: "screen.fontScale.large" as const },
  { scale: 1.3, key: "screen.fontScale.xlarge" as const },
  { scale: 1.45, key: "screen.fontScale.huge" as const },
] as const;

/**
 * Clean 5-Step Snap Horizontal Slider for Global Font Scale Selection in Settings.
 * Stripped of unnecessary preview cards, percentages, and stepper buttons.
 * Features:
 * - 5 Snap Steps: [0.9, 1.0, 1.15, 1.3, 1.45]
 * - "작게" (Small) / "크게" (Large) visual labels above the slider
 * - Smooth pointer drag with setPointerCapture and touch-none
 * - Accessible WAI-ARIA slider role with keyboard navigation
 */
export function FontScaleSelector() {
  const { t } = useTranslation("settings");
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const setFontScale = useAccessibilityStore((state) => state.setFontScale);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const currentIndex = React.useMemo(() => {
    const idx = FONT_SCALE_STEPS.indexOf(fontScale as FontScaleStep);
    if (idx !== -1) return idx;
    let closestIdx = 0;
    let minDiff = Math.abs(fontScale - FONT_SCALE_STEPS[0]);
    for (let i = 1; i < FONT_SCALE_STEPS.length; i++) {
      const diff = Math.abs(fontScale - FONT_SCALE_STEPS[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return closestIdx;
  }, [fontScale]);

  const progressPercent = (currentIndex / (FONT_SCALE_STEPS.length - 1)) * 100;

  const calculateStepFromClientX = React.useCallback(
    (clientX: number): FontScaleStep => {
      if (!trackRef.current) return fontScale as FontScaleStep;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      if (trackWidth <= 0) return fontScale as FontScaleStep;

      const thumbRadius = 14;
      let ratio: number;
      if (trackWidth <= thumbRadius * 2) {
        ratio = Math.max(0, Math.min(1, (clientX - rect.left) / trackWidth));
      } else {
        const usableWidth = trackWidth - thumbRadius * 2;
        const relativeX = clientX - (rect.left + thumbRadius);
        ratio = Math.max(0, Math.min(1, relativeX / usableWidth));
      }
      const targetIndex = Math.round(ratio * (FONT_SCALE_STEPS.length - 1));
      return FONT_SCALE_STEPS[targetIndex];
    },
    [fontScale],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore in environments where setPointerCapture is unsupported
    }
    setIsDragging(true);
    const newStep = calculateStepFromClientX(e.clientX);
    setFontScale(newStep);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newStep = calculateStepFromClientX(e.clientX);
    if (newStep !== fontScale) {
      setFontScale(newStep);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const newStep = calculateStepFromClientX(e.clientX);
    setFontScale(newStep);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        if (currentIndex < FONT_SCALE_STEPS.length - 1) {
          setFontScale(FONT_SCALE_STEPS[currentIndex + 1]);
        }
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        if (currentIndex > 0) {
          setFontScale(FONT_SCALE_STEPS[currentIndex - 1]);
        }
        break;
      case "Home":
        e.preventDefault();
        setFontScale(FONT_SCALE_STEPS[0]);
        break;
      case "End":
        e.preventDefault();
        setFontScale(FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1]);
        break;
      case "PageUp":
        e.preventDefault();
        setFontScale(
          FONT_SCALE_STEPS[Math.min(currentIndex + 2, FONT_SCALE_STEPS.length - 1)],
        );
        break;
      case "PageDown":
        e.preventDefault();
        setFontScale(FONT_SCALE_STEPS[Math.max(currentIndex - 2, 0)]);
        break;
    }
  };

  return (
    <div className="flex flex-col gap-3 px-5 py-4 select-none">
      {/* Title only (no description, minimalist) */}
      <span className="text-base font-bold text-foreground">
        {t("screen.fontScale.title")}
      </span>

      {/* Slider Section */}
      <div className="flex flex-col pt-1">
        {/* "작게" on left, "크게" on right above track */}
        <div className="flex items-end justify-between px-1 mb-2 text-muted-foreground select-none">
          <span className="text-base font-semibold tracking-tight">
            {t("screen.fontScale.smaller")}
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            {t("screen.fontScale.larger")}
          </span>
        </div>

        {/* 5-Step Snap Slider */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={handleTrackClick}
          className="relative flex h-8 w-full touch-none select-none items-center cursor-pointer"
        >
          {/* Background Track */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-150"
              style={{
                width: `calc(14px + (100% - 28px) * ${progressPercent / 100})`,
              }}
            />
          </div>

          {/* Step Tick Dots */}
          <div className="absolute inset-x-0 flex justify-between px-[11px] pointer-events-none">
            {FONT_SCALE_STEPS.map((step, idx) => (
              <div
                key={step}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  idx <= currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>

          {/* Slider Thumb */}
          <div
            role="slider"
            tabIndex={0}
            aria-label={t("screen.fontScale.groupLabel")}
            aria-valuenow={fontScale}
            aria-valuemin={FONT_SCALE_STEPS[0]}
            aria-valuemax={FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1]}
            aria-valuetext={t(FONT_SCALE_CONFIG[currentIndex].key)}
            aria-orientation="horizontal"
            onKeyDown={handleKeyDown}
            className="absolute -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-background border-[3px] border-primary shadow-[0_2px_8px_rgba(0,100,255,0.25)] transition-transform duration-100 hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            style={{
              left: `calc(14px + (100% - 28px) * ${progressPercent / 100})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
