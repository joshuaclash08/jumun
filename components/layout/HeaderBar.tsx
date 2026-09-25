"use client";

import * as React from "react";
import { Utensils, ShoppingBag } from "lucide-react";
import type { StoreInfo } from "@/lib/types";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { orderPath, tablePath } from "@/lib/routes";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  // Heuristic, not exact: this page can't fully distinguish a QR/NFC scan
  // (table already known, no prior in-app screen) from the manual entry flow
  // (OrderTypeSelectView -> TableSelectView), since both resolve to the same
  // ?table= URL shape. Routing dine-in back to the table picker (rather than
  // all the way to the order-type picker, which used to skip a real step for
  // manual entrants) is the closer, safer guess either way.
  const backHref =
    storeInfo.orderType === "dine-in"
      ? tablePath(storeInfo.storeId)
      : orderPath(storeInfo.storeId);

  return (
    <header className="flex items-center justify-between gap-3 px-4 h-14 bg-background shrink-0">
      {/* Left: Back Navigation Button + Store Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <BackButton href={backHref} label="뒤로 이동" className="-ml-1" />

        <h1
          className="text-lg sm:text-xl font-black text-foreground tracking-tight truncate"
          aria-label={`${storeInfo.storeName}, ${
            storeInfo.orderType === "dine-in"
              ? `${storeInfo.table}번 테이블`
              : "포장"
          }`}
        >
          {storeInfo.storeName}
        </h1>
      </div>

      {/* Right: Table Number or Takeout Badge + Settings */}
      <div className="flex items-center gap-2 shrink-0">
        {/* aria-hidden -- the h1's aria-label above already carries this as
            one complete sentence for screen readers; this pill is a visual
            reinforcement for sighted users, not a second source of truth. */}
        {storeInfo.orderType === "dine-in" ? (
          <div
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-extrabold text-secondary-foreground border border-secondary"
          >
            <Utensils className="size-3.5 stroke-[2.5] shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{storeInfo.table}번 테이블</span>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-extrabold text-muted-foreground border border-border/60"
          >
            <ShoppingBag className="size-3.5 stroke-[2.5] text-foreground shrink-0" aria-hidden="true" />
            <span className="text-foreground">포장</span>
          </div>
        )}

        <SettingsIconButton className="-mr-1" />
      </div>
    </header>
  );
}


