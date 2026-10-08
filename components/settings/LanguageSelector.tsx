"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface LanguageSelectorProps {
  className?: string;
}

/**
 * Dropdown Menu selector for Language in Settings.
 * Uses native OS dropdown behavior (<select>) for optimal mobile/desktop usability,
 * accessibility, and seamless scalability for future locales.
 */
export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { t, language, setLanguage } = useTranslation("settings");

  return (
    <div
      className={cn(
        "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none",
        className,
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="text-base font-bold text-foreground">
          {t("languageAndReset.language")}
        </span>
      </div>

      <div className="relative inline-flex items-center shrink-0">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Locale)}
          aria-label={t("languageAndReset.language")}
          className="appearance-none rounded-[12px] border border-border/60 bg-muted/40 hover:bg-muted/70 active:bg-muted px-3.5 py-2 pr-8 text-base font-bold text-foreground transition-colors cursor-pointer focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {SUPPORTED_LOCALES.map((item) => (
            <option
              key={item.code}
              value={item.code}
              className="bg-popover text-foreground font-medium"
            >
              {item.nativeName}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
