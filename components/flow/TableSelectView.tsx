"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { cn } from "@/lib/utils";
import type { StoreListing } from "@/lib/types";

interface TableSelectViewProps {
  store: StoreListing;
}

// Dedicated table-selection screen, reached only after choosing dine-in on
// OrderTypeSelectView. A real table roster doesn't exist yet (Phase 1 seed
// data), so this offers every number up to the store's tableCount.
export function TableSelectView({ store }: TableSelectViewProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const tables = React.useMemo(
    () => Array.from({ length: store.tableCount }, (_, i) => String(i + 1)),
    [store.tableCount],
  );

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-background/90 backdrop-blur-md">
        <BackButton
          href={`/order/${store.storeId}`}
          label="이전 화면으로 돌아가기"
          className="-ml-1"
        />
        <SettingsIconButton className="-mr-1" />
      </header>


      <div className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-primary">{store.storeName}</p>
          <h1 className="text-2xl font-extrabold text-foreground leading-snug">
            어느 테이블에 앉으셨나요?
          </h1>
        </div>

        <div
          role="group"
          aria-label="테이블 번호 선택"
          className="grid grid-cols-4 gap-2.5"
        >
          {tables.map((tableId) => (
            <motion.button
              key={tableId}
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => router.push(`/order/${store.storeId}?table=${tableId}`)}
              aria-label={`${tableId}번 테이블`}
              className={cn(
                "flex h-16 min-h-[44px] items-center justify-center rounded-[16px] border-2 border-border bg-card font-extrabold text-lg text-foreground transition-all outline-none",
                "hover:border-primary/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {tableId}
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}
