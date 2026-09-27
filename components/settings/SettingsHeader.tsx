"use client";

import * as React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { useTranslation } from "@/lib/i18n";

interface SettingsHeaderProps {
  title: string;
  onBack?: () => void;
  href?: string;
}

// Shared back+title bar for every /settings screen -- compact Toss production standard
export function SettingsHeader({ title, onBack, href }: SettingsHeaderProps) {
  const { t } = useTranslation("common");

  return (
    <header className="sticky top-0 z-40 grid grid-cols-[44px_1fr_44px] items-center h-14 px-4 bg-background border-b border-border/40">
      <BackButton
        label={t("back")}
        className="-ml-1"
        onClick={onBack}
        href={href}
      />
      <h1 className="text-lg sm:text-xl font-bold text-foreground text-center truncate">
        {title}
      </h1>
      <div className="w-11" aria-hidden="true" />
    </header>
  );
}
