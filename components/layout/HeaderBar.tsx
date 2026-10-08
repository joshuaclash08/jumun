"use client";

import * as React from "react";
import Link from "next/link";
import { Utensils, ShoppingBag } from "lucide-react";
import type { StoreInfo } from "@/lib/types";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { orderPath, tablePath } from "@/lib/routes";
import { useTranslation } from "@/lib/i18n";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  const { t: tCommon } = useTranslation("common");

  const diningLabel =
    storeInfo.orderType === "dine-in"
      ? tCommon("tableNumber", { table: storeInfo.table })
      : tCommon("takeout");

  const changeHref =
    storeInfo.orderType === "dine-in"
      ? tablePath(storeInfo.storeId)
      : orderPath(storeInfo.storeId);

  const changeAriaLabel =
    storeInfo.orderType === "dine-in"
      ? `${diningLabel}, 테이블 변경하기`
      : `${diningLabel}, 주문 방식 변경하기`;

  return (
    <header className="flex items-center justify-between gap-2.5 px-4 h-14 bg-background border-b border-border/40 shrink-0">
      {/* Left: Store Name (Back button removed for QR menu root page) */}
      <div className="flex items-center min-w-0">
        <h1
          className="text-lg sm:text-xl font-black text-foreground tracking-tight truncate"
          aria-label={`${storeInfo.storeName}, ${diningLabel}`}
        >
          {storeInfo.storeName}
        </h1>
      </div>

      {/* Right: Clickable Table Number / Takeout Badge + Language Dropdown + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {storeInfo.orderType === "dine-in" ? (
          <Link
            href={changeHref}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-all px-2.5 sm:px-3 py-1 text-base font-extrabold text-secondary-foreground border border-secondary shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={changeAriaLabel}
            title={changeAriaLabel}
          >
            <Utensils
              className="size-3.5 stroke-[2.5] shrink-0"
              aria-hidden="true"
            />
            <span className="tabular-nums">
              {tCommon("tableNumber", { table: storeInfo.table })}
            </span>
          </Link>
        ) : (
          <Link
            href={changeHref}
            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-muted hover:bg-muted/80 active:scale-95 transition-all px-2.5 sm:px-3 py-1 text-base font-extrabold text-muted-foreground hover:text-foreground border border-border/60 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={changeAriaLabel}
            title={changeAriaLabel}
          >
            <ShoppingBag
              className="size-3.5 stroke-[2.5] text-foreground shrink-0"
              aria-hidden="true"
            />
            <span className="text-foreground">{tCommon("takeout")}</span>
          </Link>
        )}

        <SettingsIconButton className="-mr-1" />
      </div>
    </header>
  );
}
