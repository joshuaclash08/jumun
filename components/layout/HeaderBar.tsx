"use client";

import * as React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
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
    <header className="relative z-20 flex items-center justify-between px-4 py-3 bg-background">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-black text-foreground">
          {storeInfo.storeName}
        </h1>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-base font-extrabold text-primary">
          {storeInfo.table}번 테이블
        </span>
      </div>

      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.90 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-2xs hover:bg-muted text-foreground border-border bg-background"
        >
          <Link href="/settings" aria-label="설정 열기">
            <Settings className="h-5.5 w-5.5" aria-hidden="true" />
          </Link>
        </Button>
      </motion.div>
    </header>
  );
}
