"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { IconNavButton } from "@/components/ui/IconNavButton";
import { useTranslation } from "@/lib/i18n";

export interface BackButtonProps {
  /** Target URL to navigate to. If omitted and onClick is not provided, defaults to router.back(). */
  href?: string;
  /** Custom click handler. If omitted and href is not provided, defaults to router.back(). */
  onClick?: () => void;
  /** Accessible label for screen readers. Defaults to translated "back". */
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
  label,
  className,
}: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const resolvedLabel = label ?? t("back");

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (!href) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <IconNavButton
      icon={<ChevronLeft className="size-6 stroke-[2.5]" aria-hidden="true" />}
      href={href}
      onClick={href ? onClick : handleClick}
      label={resolvedLabel}
      className={className}
    />
  );
}
