"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

interface LandingHeroVisualProps {
  className?: string;
}

export function LandingHeroVisual({ className }: LandingHeroVisualProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const [scanAnimMode, setScanAnimMode] = React.useState<"nfc" | "qr">("nfc");

  React.useEffect(() => {
    // Swapping shapes every 3s is itself a motion event, independent of the
    // cross-fade transition duration below -- gate the rotation entirely,
    // not just how it transitions, or reduceMotion users still see strobing.
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setScanAnimMode((prev) => (prev === "nfc" ? "qr" : "nfc"));
    }, 3000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        "relative flex h-48 w-48 items-center justify-center select-none",
        className
      )}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {scanAnimMode === "nfc" ? (
          <motion.div
            key="nfc-anim"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="flex items-center justify-center"
          >
            <svg
              className="h-32 w-32 text-foreground"
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
              <motion.g
                animate={reduceMotion ? undefined : { y: [1, -3, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }}
              >
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
              </motion.g>
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="qr-anim"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="flex items-center justify-center"
          >
            <svg
              className="h-32 w-32 text-foreground"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.g
                style={{ transformOrigin: "24px 24px" }}
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 0.94, 1.03, 1] }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
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
              </motion.g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
