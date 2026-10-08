"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

interface LandingHeroVisualProps {
  className?: string;
}

/**
 * Animated NFC / QR Code visual in Toss style.
 * Uses 100% pure CSS GPU-accelerated keyframe animations.
 *
 * Benefits:
 * - Immediate SSR paint (visible at 0ms, zero opacity: 0 flash or layout blank)
 * - Zero Web Animations API / Framer Motion SVG bugs on Safari 15 / WebKit
 * - Native 60/120fps hardware compositor performance
 * - Native prefers-reduced-motion integration
 */
export function LandingHeroVisual({ className }: LandingHeroVisualProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const [scanAnimMode, setScanAnimMode] = React.useState<"nfc" | "qr">("nfc");

  React.useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setScanAnimMode((prev) => (prev === "nfc" ? "qr" : "nfc"));
    }, 3000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const isNfc = scanAnimMode === "nfc";

  return (
    <div
      className={cn(
        "relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* ── NFC Visual Stage ────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
          isNfc
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <svg
          className="h-24 w-24 sm:h-28 sm:w-28 text-foreground"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* NFC receiver waves */}
          <g>
            <path d="M20.5 2.5a5 5 0 0 0 7 0" strokeWidth="2.2" />
            <path d="M17 6.5a9 9 0 0 0 14 0" strokeWidth="2.2" />
          </g>

          {/* Moving phone */}
          <g className={reduceMotion ? undefined : "animate-nfc-phone"}>
            <rect
              x="15.5"
              y="17.5"
              width="17"
              height="28"
              rx="3.8"
              className="fill-background"
              strokeWidth="2.2"
            />
            <rect
              x="21.5"
              y="20"
              width="5"
              height="1.8"
              rx="0.9"
              fill="currentColor"
              stroke="none"
            />
          </g>
        </svg>
      </div>

      {/* ── QR Visual Stage ─────────────────────────────────────── */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out",
          !isNfc
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <svg
          className="h-24 w-24 sm:h-28 sm:w-28 text-foreground"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g className={reduceMotion ? undefined : "animate-qr-pulse"}>
            {/* Top-Left Finder */}
            <rect x="10" y="10" width="11" height="11" rx="1.5" />
            <rect
              x="12.5"
              y="12.5"
              width="6"
              height="6"
              rx="0.75"
              fill="currentColor"
              stroke="none"
            />

            {/* Top-Right Finder */}
            <rect x="27" y="10" width="11" height="11" rx="1.5" />
            <rect
              x="29.5"
              y="12.5"
              width="6"
              height="6"
              rx="0.75"
              fill="currentColor"
              stroke="none"
            />

            {/* Bottom-Left Finder */}
            <rect x="10" y="27" width="11" height="11" rx="1.5" />
            <rect
              x="12.5"
              y="29.5"
              width="6"
              height="6"
              rx="0.75"
              fill="currentColor"
              stroke="none"
            />

            {/* Bottom-Right Data Dot */}
            <rect
              x="29.5"
              y="29.5"
              width="6"
              height="6"
              rx="1.2"
              fill="currentColor"
              stroke="none"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
