"use client";

import * as React from "react";
import Link from "next/link";
import type { StoreInfo } from "@/lib/types";
import { Settings } from "lucide-react";
import { StaffCallButton } from "@/components/flow/StaffCallButton";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface HeaderBarProps {
  storeInfo: StoreInfo;
}

export function HeaderBar({ storeInfo }: HeaderBarProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-md">
      <div className="flex flex-col text-left">
        <h1 className="text-lg font-bold text-foreground leading-tight">
          {storeInfo.storeName}
        </h1>
        <span className="text-xs font-medium text-muted-foreground">
          {storeInfo.table}번 테이블
        </span>
      </div>

      <div className="flex items-center gap-2">
        <StaffCallButton storeInfo={storeInfo} />

        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-[--radius-md] shadow-2xs hover:bg-muted text-foreground border-border/80"
          >
            <Link href="/settings" aria-label="설정 열기">
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
