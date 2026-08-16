"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import type { StoreInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const pathname = usePathname();
  const backHref = pathname || `/order/${storeInfo.storeId}`;

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[40px_1fr_40px] items-center h-14 px-4 bg-background/90 backdrop-blur-md">
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.90 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-md shadow-sm border border-border/50 flex items-center justify-center -ml-1"
        >
          <Link href={backHref} aria-label="뒤로 이동">
            <ChevronLeft className="size-6 stroke-[2.5]" aria-hidden="true" />
          </Link>
        </Button>
      </motion.div>

      <div className="flex items-center justify-center gap-2 min-w-0 px-2 text-center">
        <h1 className="text-base sm:text-lg font-black text-foreground truncate">
          {storeInfo.storeName}
        </h1>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs sm:text-sm font-extrabold text-primary shrink-0">
          {storeInfo.orderType === "dine-in"
            ? `${storeInfo.table}번 테이블`
            : "포장"}
        </span>
      </div>

      <div className="w-10" aria-hidden="true" />
    </header>
  );
}
