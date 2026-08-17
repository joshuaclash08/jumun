"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import type { SettingsRowProps } from "./SettingsRow";

/** Standalone rounded settings card matching Image 1 & Image 3 */
export function SettingsCard({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  trailing,
  className,
  iconBgClass = "bg-[#E8F3FF]",
  iconColorClass = "text-primary",
  isSelected = false,
  ariaPressed,
}: SettingsRowProps & { onClick?: () => void; isSelected?: boolean; ariaPressed?: boolean }) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const cardInner = (
    <div
      className={cn(
        "flex w-full items-center gap-4 rounded-[24px] bg-card p-4 sm:p-5 border transition-all shadow-resting text-left",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-layered"
          : "border-border hover:border-primary/40 hover:shadow-layered",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px]",
            iconBgClass,
            iconColorClass
          )}
          aria-hidden="true"
        >
          <Icon className="h-6 w-6 stroke-[2.2]" />
        </div>
      )}
      <div className="flex flex-1 min-w-0 flex-col gap-0.5">
        <span className="text-lg font-bold text-foreground leading-snug">{label}</span>
        {description && (
          <span className="text-base font-medium text-muted-foreground leading-relaxed">
            {description}
          </span>
        )}
      </div>
      {/* NOTE: `trailing ?? <ChevronRight />` -- `??` treats `null` as nullish
          too, so passing `trailing={null}` still renders the chevron. A
          future caller that wants to truly hide it must pass an explicit
          empty element instead. Known footgun, left as-is. */}
      {trailing ?? (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
      )}
    </div>
  );

  if (href) {
    return (
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full"
      >
        <Link
          href={href}
          className="block rounded-[24px]"
        >
          {cardInner}
        </Link>
      </motion.div>
    );
  }

  if (onClick) {
    return (
      <motion.button
        type="button"
        aria-pressed={ariaPressed}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onClick}
        className="w-full text-left rounded-[24px]"
      >
        {cardInner}
      </motion.button>
    );
  }

  return <div className="w-full">{cardInner}</div>;
}
