"use client";

import * as React from "react";
import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center px-4 bg-background/90 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full text-foreground hover:bg-muted -ml-1.5"
          >
            <Link href="/" aria-label="홈으로 이동">
              <ChevronLeft className="size-7 stroke-[2.8]" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-black text-foreground">
            {storeInfo.storeName}
          </h1>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-base font-extrabold text-primary">
            {storeInfo.orderType === "dine-in" ? `${storeInfo.table}번 테이블` : "포장"}
          </span>
        </div>
      </div>
    </header>
  );
}
