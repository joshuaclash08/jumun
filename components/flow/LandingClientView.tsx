"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "./LandingHeroVisual";
import { StoreSelectorList } from "./StoreSelectorList";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { getAvailableStores } from "@/lib/services/StoreService";
import type { StoreListing } from "@/lib/types";

export function LandingClientView() {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const stores = React.useMemo<StoreListing[]>(() => getAvailableStores(), []);

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between bg-background text-foreground overflow-y-auto px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* ── Top Bar (Clean minimal settings trigger only) ───────── */}
      <div className="w-full max-w-md flex justify-end">
        <SettingsIconButton label="접근성 및 앱 설정 열기" />
      </div>

      {/* ── Hero Center Section (Ultra Minimalist) ──────────────── */}
      <div className="w-full max-w-md my-auto flex flex-col items-center text-center py-2 sm:py-4">
        {/* Animated NFC/QR Visual */}
        <div className="mb-2 sm:mb-3">
          <LandingHeroVisual />
        </div>

        {/* Minimalist Headline & Subtitle */}
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground leading-snug">
          테이블에 폰을 대면
          <br />
          바로 주문할 수 있어요
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium mt-2">
          NFC 태그나 QR 코드를 스캔해 보세요
        </p>

        {/* Prototype Preview CTA Button */}
        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="mt-4 sm:mt-5"
        >
          <Button
            asChild
            variant="secondary"
            className="h-10 px-4 gap-1.5 font-semibold text-sm rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/50 shadow-none transition-all"
          >
            <Link href="/order/jumun-cafe-01">
              <span>프로토타입 구경하기</span>
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* ── Collapsible Store Selector ─────────────────────────── */}
      <StoreSelectorList stores={stores} />
    </main>
  );
}

