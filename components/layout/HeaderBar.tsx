"use client";

import * as React from "react";
import type { StoreInfo } from "@/lib/types";
import { Settings } from "lucide-react";
import { SettingsSheet } from "@/components/flow/SettingsSheet";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-md">
        <div className="flex flex-col text-left">
          <h1 className="text-lg font-bold text-foreground leading-tight">
            {storeInfo.storeName}
          </h1>
          <span className="text-xs font-medium text-muted-foreground">
            {storeInfo.table}번 테이블
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-border text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring outline-none active:scale-[0.96]"
          aria-label="접근성 및 환경 설정 열기"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <SettingsSheet
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
}
