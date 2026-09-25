"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

export interface IconNavButtonProps {
  /** Icon element rendered inside the button. */
  icon: React.ReactNode;
  /** Target URL to navigate to. When provided, the button renders as a Link. */
  href?: string;
  /**
   * Click handler. In the `href` branch it is attached to the Link alongside
   * navigation; in the no-`href` branch it is the button's only click handler.
   */
  onClick?: (e: React.MouseEvent) => void;
  /** Accessible label for screen readers. */
  label: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Shared circular icon nav button shell: 44px touch target, Toss-style ghost
 * icon layout, and spring press feedback.
 *
 * Internal primitive for {@link BackButton} and {@link SettingsIconButton} so
 * the shared chrome (touch target size, hover/press color, spring feel) is
 * defined once instead of duplicated across both.
 */
export function IconNavButton({
  icon,
  href,
  onClick,
  label,
  className,
}: IconNavButtonProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const buttonClasses = cn(
    "h-11 w-11 shrink-0 rounded-full text-foreground hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center justify-center",
    className
  );

  if (href) {
    return (
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="shrink-0"
      >
        <Button asChild variant="ghost" size="icon" className={buttonClasses}>
          <Link href={href} aria-label={label} onClick={onClick}>
            {icon}
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="shrink-0"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        aria-label={label}
        className={buttonClasses}
      >
        {icon}
      </Button>
    </motion.div>
  );
}
