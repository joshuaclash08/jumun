"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  htmlFor?: string;
  trailing?: React.ReactNode;
  className?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

/** One row inside a settings list group -- optional icon, label(+description), trailing control or chevron. */
export function SettingsRow({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  htmlFor,
  trailing,
  className,
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary",
}: SettingsRowProps) {
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]",
              iconBgClass,
              iconColorClass
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-1 min-w-0 flex-col gap-0.5">
          <span className="text-base font-bold text-foreground">{label}</span>
          {description && (
            <span className="text-base font-medium text-muted-foreground leading-relaxed">{description}</span>
          )}
        </div>
      </div>
      {trailing ? (
        <div className="shrink-0 flex items-center">{trailing}</div>
      ) : (
        href && <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none outline-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/50",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  if (htmlFor || onClick) {
    return (
      <label
        htmlFor={htmlFor}
        onClick={onClick}
        className={cn(
          "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50",
          className
        )}
      >
        {content}
      </label>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none",
        className
      )}
    >
      {content}
    </div>
  );
}

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
  iconColorClass = "text-[#0064FF]",
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

/** Rounded card container holding a group of SettingsRows, divided by hairlines. */
export function SettingsGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] bg-card border border-border shadow-resting divide-y divide-border/60",
        className
      )}
    >
      {children}
    </div>
  );
}
