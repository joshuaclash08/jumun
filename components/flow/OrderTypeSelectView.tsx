"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Utensils, ShoppingBag } from "lucide-react";
import { SelectionCard } from "./SelectionCard";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { tablePath, takeoutPath } from "@/lib/routes";
import type { StoreListing } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface OrderTypeSelectViewProps {
  store: StoreListing;
}

export function OrderTypeSelectView({ store }: OrderTypeSelectViewProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const { t } = useTranslation("orderFlow");
  const { t: tCommon } = useTranslation("common");

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-background border-b border-border/40">
        <BackButton href="/" label={tCommon("backHome")} className="-ml-1" />
        <SettingsIconButton className="-mr-1" />
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 px-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-primary">{store.storeName}</p>
          <h1 className="text-2xl font-extrabold text-foreground leading-snug">
            {t("orderType.titleLine1")}
            <br />
            {t("orderType.titleLine2")}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectionCard
            isSelected={false}
            onClick={() => router.push(tablePath(store.storeId))}
            label={t("orderType.dineIn")}
            icon={<Utensils className="h-5 w-5" />}
            reduceMotion={reduceMotion}
          />
          <SelectionCard
            isSelected={false}
            onClick={() => router.push(takeoutPath(store.storeId))}
            label={t("orderType.takeout")}
            icon={<ShoppingBag className="h-5 w-5" />}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>
    </main>
  );
}
