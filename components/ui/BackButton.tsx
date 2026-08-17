"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  /** Target URL to navigate to. If omitted and onClick is not provided, defaults to router.back(). */
  href?: string;
  /** Custom click handler. If omitted and href is not provided, defaults to router.back(). */
  onClick?: () => void;
  /** Accessible label for screen readers. Defaults to "뒤로 이동". */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Universal Top-Left Back / Close Navigation Button.
 * Features a clean, distraction-free Toss-style ghost icon layout
 * with standard 44px touch target, smooth scale press feedback, and accessible labeling.
 */
export function BackButton({
  href,
  onClick,
  label = "뒤로 이동",
  className,
}: BackButtonProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (!href) {
      e.preventDefault();
      router.back();
    }
  };

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
        <Button
          asChild
          variant="ghost"
          size="icon"
          className={buttonClasses}
        >
          <Link href={href} aria-label={label} onClick={onClick}>
            <ChevronLeft className="size-6 stroke-[2.5]" aria-hidden="true" />
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
        onClick={handleClick}
        aria-label={label}
        className={buttonClasses}
      >
        <ChevronLeft className="size-6 stroke-[2.5]" aria-hidden="true" />
      </Button>
    </motion.div>
  );
}
