"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface OneHandedContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * OS Keyboard Style One-Handed Layout Container
 * Emulates Android, iOS, and iPadOS one-handed keyboard ergonomics:
 * - Content area compressed to ~82% width docked to active side
 * - Gutter rail hosts a flip direction arrow button and a full-width expand button
 */
export function OneHandedContainer({ children, className }: OneHandedContainerProps) {
  const oneHandedMode = useAccessibilityStore((state) => state.oneHandedMode);
  const setOneHandedMode = useAccessibilityStore((state) => state.setOneHandedMode);
  const { speak } = useVoiceGuide();
  const { t } = useTranslation("menu");

  const handleSwitchMode = (targetMode: "left" | "right") => {
    setOneHandedMode(targetMode);
    const msg =
      targetMode === "left"
        ? t("layout.leftHandSwitchedVoice")
        : t("layout.rightHandSwitchedVoice");
    speak(msg);
  };

  const handleExpandFull = () => {
    setOneHandedMode("none");
    speak(t("layout.expandFullVoice"));
  };

  if (oneHandedMode === "none") {
    return (
      <div className={cn("w-full max-w-[840px] mx-auto min-h-screen relative", className)}>
        {children}
      </div>
    );
  }

  const isLeft = oneHandedMode === "left";
  const switchLabel = isLeft ? t("layout.switchToRight") : t("layout.switchToLeft");
  const expandLabel = t("layout.expandFull");

  const gutterRail = (
    <aside
      aria-label={t("layout.oneHandedRailAria")}
      className={cn(
        "sticky top-0 h-screen w-[18%] sm:w-[16%] flex flex-col items-center justify-center gap-4 bg-muted/40 select-none p-1 z-40",
        isLeft ? "border-l border-border/40" : "border-r border-border/40",
      )}
    >
      {/* Flip side arrow button */}
      <button
        type="button"
        onClick={() => handleSwitchMode(isLeft ? "right" : "left")}
        className="w-11 h-11 rounded-[14px] bg-card border border-border/80 shadow-xs flex items-center justify-center text-foreground hover:bg-accent hover:text-primary active:scale-[0.95] transition-all cursor-pointer"
        aria-label={switchLabel}
        title={switchLabel}
      >
        {isLeft ? <ArrowRight className="w-5 h-5 text-primary" /> : <ArrowLeft className="w-5 h-5 text-primary" />}
      </button>

      {/* Expand full width button */}
      <button
        type="button"
        onClick={handleExpandFull}
        className="w-11 h-11 rounded-[14px] bg-card border border-border/80 shadow-xs flex items-center justify-center text-foreground hover:bg-accent hover:text-primary active:scale-[0.95] transition-all cursor-pointer"
        aria-label={expandLabel}
        title={expandLabel}
      >
        <Maximize2 className="w-4 h-4 text-muted-foreground" />
      </button>
    </aside>
  );

  return (
    <div className={cn("w-full max-w-[840px] mx-auto min-h-screen flex relative overflow-x-clip", className)}>
      {!isLeft && gutterRail}

      <div
        className={cn(
          "w-[82%] sm:w-[84%] shrink-0 min-h-screen relative bg-background transition-all duration-200",
          isLeft ? "mr-auto" : "ml-auto",
        )}
      >
        {children}
      </div>

      {isLeft && gutterRail}
    </div>
  );
}
