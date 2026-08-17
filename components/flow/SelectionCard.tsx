"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  reduceMotion: boolean;
}

/** Reusable accessible selection card — semantic <button> with Toss style press indicator */
export function SelectionCard({
  isSelected,
  onClick,
  label,
  sublabel,
  icon,
  reduceMotion,
}: SelectionCardProps) {
  const fullLabel = sublabel ? `${label}, ${sublabel}` : label;

  return (
    <motion.button
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={fullLabel}
      className={cn(
        "relative flex min-h-[80px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[18px] border-2 p-3.5 font-bold transition-all",
        isSelected
          ? "border-primary bg-primary/5 text-primary shadow-2xs"
          : "border-border bg-card text-foreground hover:bg-muted/30"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-1 pointer-events-none" aria-hidden="true">
        {isSelected && (
          <motion.div
            initial={reduceMotion ? undefined : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </motion.div>
        )}
        {icon && <span className="mb-0.5">{icon}</span>}
        <span className="text-base font-bold leading-tight">{label}</span>
        {sublabel && (
          <span className={cn("text-base font-medium", isSelected ? "text-primary/80" : "text-muted-foreground")}>
            {sublabel}
          </span>
        )}
      </div>
    </motion.button>
  );
}
