"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { cn } from "@/lib/utils";
import { orderPath, tablePath } from "@/lib/routes";
import type { StoreListing } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface TableSelectViewProps {
  store: StoreListing;
}

export function TableSelectView({ store }: TableSelectViewProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const { t } = useTranslation("orderFlow");
  const { t: tCommon } = useTranslation("common");

  const tables = React.useMemo(
    () => Array.from({ length: store.tableCount }, (_, i) => String(i + 1)),
    [store.tableCount],
  );

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground"
    >
      <FlowHeader
        backHref={orderPath(store.storeId)}
        backLabel={tCommon("back")}
      />

      <div className="flex flex-1 flex-col gap-6 px-5 pt-2 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-bold text-primary">{store.storeName}</p>
          <h1 className="text-2xl font-extrabold text-foreground leading-snug">
            {t("tableSelect.title")}
          </h1>
        </div>

        <div
          role="group"
          aria-label={t("tableSelect.groupAria")}
          className="grid grid-cols-4 gap-2.5"
        >
          {tables.map((tableId) => (
            <motion.button
              key={tableId}
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => router.push(tablePath(store.storeId, tableId))}
              aria-label={t("tableSelect.tableAria", { tableId })}
              className={cn(
                "flex h-16 min-h-[44px] items-center justify-center rounded-[16px] border-2 border-border bg-card font-extrabold text-lg text-foreground transition-all",
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
