"use client";

import * as React from "react";
import { Utensils, ShoppingBag } from "lucide-react";
import type { StoreInfo } from "@/lib/types";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { orderPath, tablePath } from "@/lib/routes";
import { useTranslation } from "@/lib/i18n";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  const { t: tCommon } = useTranslation("common");

  const backHref =
    storeInfo.orderType === "dine-in"
      ? tablePath(storeInfo.storeId)
      : orderPath(storeInfo.storeId);

  const diningLabel =
    storeInfo.orderType === "dine-in"
      ? tCommon("tableNumber", { table: storeInfo.table })
      : tCommon("takeout");

  return (
    <header className="flex items-center justify-between gap-3 px-4 h-14 bg-background shrink-0">
      {/* Left: Back Navigation Button + Store Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <BackButton href={backHref} label={tCommon("back")} className="-ml-1" />

        <h1
          className="text-lg sm:text-xl font-black text-foreground tracking-tight truncate"
          aria-label={`${storeInfo.storeName}, ${diningLabel}`}
        >
          {storeInfo.storeName}
        </h1>
      </div>

      {/* Right: Table Number or Takeout Badge + Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {storeInfo.orderType === "dine-in" ? (
          <div
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-extrabold text-secondary-foreground border border-secondary"
          >
            <Utensils
              className="size-3.5 stroke-[2.5] shrink-0"
              aria-hidden="true"
            />
            <span className="tabular-nums">
              {tCommon("tableNumber", { table: storeInfo.table })}
            </span>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-extrabold text-muted-foreground border border-border/60"
          >
            <ShoppingBag
              className="size-3.5 stroke-[2.5] text-foreground shrink-0"
              aria-hidden="true"
            />
            <span className="text-foreground">{tCommon("takeout")}</span>
          </div>
        )}

        <SettingsIconButton className="-mr-1" />
      </div>
    </header>
  );
}
