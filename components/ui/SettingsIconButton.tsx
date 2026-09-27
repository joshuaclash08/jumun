"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { IconNavButton } from "@/components/ui/IconNavButton";
import { useTranslation } from "@/lib/i18n";

export interface SettingsIconButtonProps {
  /** Accessible label for screen readers. Defaults to translated "openSettings". */
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
  label,
  href = "/settings",
  className,
}: SettingsIconButtonProps) {
  const { t } = useTranslation("common");
  const resolvedLabel = label ?? t("openSettings");

  return (
    <IconNavButton
      icon={<Settings className="size-5.5 stroke-[2.2]" aria-hidden="true" />}
      href={href}
      label={resolvedLabel}
      className={className}
    />
  );
}
