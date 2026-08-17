"use client";

import * as React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

export interface SettingsIconButtonProps {
  /** Accessible label for screen readers. Defaults to "설정 열기". */
  label?: string;
  /** Target settings route. Defaults to "/settings". */
  href?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Universal Settings Navigation Icon Button.
 * Features a clean Toss-style ghost icon layout linking directly to /settings,
 * with standard 44px touch target, smooth scale press feedback, and accessible labeling.
 */
export function SettingsIconButton({
  label = "설정 열기",
  href = "/settings",
  className,
}: SettingsIconButtonProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <motion.div
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="shrink-0"
    >
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={cn(
          "h-11 w-11 shrink-0 rounded-full text-foreground hover:bg-muted/50 active:bg-muted/70 transition-colors flex items-center justify-center",
          className
        )}
      >
        <Link href={href} aria-label={label}>
          <Settings className="size-5.5 stroke-[2.2]" aria-hidden="true" />
        </Link>
      </Button>
    </motion.div>
  );
}
