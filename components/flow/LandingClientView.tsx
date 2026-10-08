"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "./LandingHeroVisual";
import { StoreSelectorList } from "./StoreSelectorList";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { getAvailableStores } from "@/lib/services/StoreService";
import type { StoreListing } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

export function LandingClientView() {
  const stores = React.useMemo<StoreListing[]>(() => getAvailableStores(), []);
  const { t } = useTranslation("landing");
  const { t: tCommon } = useTranslation("common");

  return (
    <main
      id="main-content"
      className="flex min-h-[100vh] min-h-[100dvh] w-full flex-col items-center justify-between bg-background text-foreground overflow-y-auto px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* ── Top Bar (Clean minimal settings trigger only) ───────── */}
      <div className="w-full max-w-md flex justify-end">
        <SettingsIconButton label={tCommon("openSettingsAria")} />
      </div>

      {/* ── Hero Center Section (Ultra Minimalist) ──────────────── */}
      <div className="w-full max-w-md my-auto flex flex-col items-center text-center py-2 sm:py-4">
        {/* Animated NFC/QR Visual */}
        <div className="mb-2 sm:mb-3">
          <LandingHeroVisual />
        </div>

        {/* Minimalist Headline & Subtitle */}
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground leading-snug">
          {t("heroTitleLine1")}
          <br />
          {t("heroTitleLine2")}
        </h1>
        <p className="text-base text-muted-foreground font-medium mt-2">
          {t("heroSubtitle")}
        </p>

        {/* Prototype Preview CTA Button */}
        <div className="mt-4 sm:mt-5">
          <Button
            asChild
            variant="secondary"
            className="h-10 px-4 gap-1.5 font-semibold text-base rounded-full bg-secondary/80 hover:bg-secondary active:scale-[0.96] text-secondary-foreground border border-border/50 shadow-none transition-all touch-manipulation select-none cursor-pointer"
          >
            <Link href="/order/jumun-cafe-01">
              <span>{t("viewPrototype")}</span>
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Collapsible Store Selector ─────────────────────────── */}
      <StoreSelectorList stores={stores} />
    </main>
  );
}
