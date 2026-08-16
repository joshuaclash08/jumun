"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Store, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "./LandingHeroVisual";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { getAvailableStores } from "@/lib/services/StoreService";
import type { StoreListing } from "@/lib/types";

export function LandingClientView() {
  const [isStoreListOpen, setIsStoreListOpen] = React.useState(false);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const stores = React.useMemo<StoreListing[]>(() => getAvailableStores(), []);

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between bg-background text-foreground overflow-y-auto px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* ── Top Bar (Clean minimal settings trigger only) ───────── */}
      <div className="w-full max-w-md flex justify-end">
        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-md shadow-sm border border-border/50 flex items-center justify-center"
          >
            <Link href="/settings" aria-label="접근성 및 앱 설정 열기">
              <Settings className="size-5.5 stroke-[2.2]" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>
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

      {/* ── Collapsible Store Selector (TDS Redesign) ───────────── */}
      <div className="w-full max-w-md pt-1 pb-2">
        {/* Collapsible Trigger Row */}
        <button
          type="button"
          onClick={() => setIsStoreListOpen((prev) => !prev)}
          aria-expanded={isStoreListOpen}
          aria-controls="available-stores-list"
          className="w-full flex items-center justify-between py-3 px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[16px] bg-muted/40 hover:bg-muted/70 border border-border/40 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-background text-foreground shadow-xs border border-border/40">
              <Store className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold text-foreground">
                직접 매장 선택하기
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                ({stores.length})
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isStoreListOpen ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="text-muted-foreground pr-0.5"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.div>
        </button>

        {/* Expandable Store List */}
        <AnimatePresence>
          {isStoreListOpen && (
            <motion.div
              id="available-stores-list"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 32,
                duration: reduceMotion ? 0 : undefined,
              }}
              className="overflow-hidden"
              role="region"
              aria-label="주문 가능한 매장 목록"
            >
              <div className="flex flex-col gap-2 pt-2.5">
                {stores.map((store) => (
                  <motion.div
                    key={store.storeId}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={`/order/${store.storeId}`}
                      className="block outline-none rounded-[16px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div className="flex items-center justify-between gap-3 rounded-[16px] p-3.5 bg-card border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                        {/* Left: icon + name/branch + address */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                            <Store
                              className="h-5 w-5 stroke-[2]"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-[15px] text-foreground truncate leading-tight">
                                {store.storeName}
                              </span>
                              <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-[6px]">
                                {store.branchKo}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-muted-foreground truncate mt-1">
                              {store.addressKo}
                            </span>
                          </div>
                        </div>

                        {/* Right: distance badge + chevron */}
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {store.distanceKo}
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-muted-foreground/70"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
