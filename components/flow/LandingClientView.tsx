"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  MapPin,
  ChevronRight,
  Store,
  QrCode,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LandingHeroVisual } from "./LandingHeroVisual";
import { QrScannerModal } from "./QrScannerModal";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { getAvailableStores } from "@/lib/services/StoreService";
import type { StoreListing } from "@/lib/types";

export function LandingClientView() {
  const [isStoreListOpen, setIsStoreListOpen] = React.useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = React.useState(false);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const stores = React.useMemo<StoreListing[]>(() => getAvailableStores(), []);

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between bg-background text-foreground overflow-y-auto px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* ── Top Bar (Clean minimal settings trigger only) ───────── */}
      <div className="w-full max-w-md flex justify-end">
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="접근성 및 앱 설정 열기"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      {/* ── Hero Center Section (Ultra Minimalist) ──────────────── */}
      <div className="w-full max-w-md my-auto flex flex-col items-center text-center py-2 sm:py-4">
        {/* Animated NFC/QR Visual */}
        <div className="mb-2 sm:mb-3">
          <LandingHeroVisual />
        </div>

        {/* Minimalist Headline & Subtitle */}
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-foreground leading-snug">
          테이블 태그에 폰을 대거나
          <br />
          QR 코드를 스캔하세요
        </h1>

        {/* Main CTA Button */}
        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full max-w-xs mt-4 sm:mt-5"
        >
          <Button
            type="button"
            size="lg"
            onClick={() => setIsQrScannerOpen(true)}
            className="w-full gap-2.5 font-bold text-base bg-primary text-primary-foreground shadow-none hover:bg-primary/95 rounded-[16px] h-13 sm:h-14"
          >
            <QrCode className="h-5 w-5" aria-hidden="true" />
            카메라로 QR 스캔하기
          </Button>
        </motion.div>
      </div>

      {/* ── Collapsible Store Selector (Previous Clean Minimal Pattern) ─ */}
      <div className="w-full max-w-md pt-1 pb-2">
        {/* Collapsible Trigger Row */}
        <button
          type="button"
          onClick={() => setIsStoreListOpen((prev) => !prev)}
          aria-expanded={isStoreListOpen}
          aria-controls="available-stores-list"
          className="w-full flex items-center justify-between py-3.5 px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[16px] hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
              <Store className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">
                직접 매장 선택하기
              </span>
              <span className="text-base font-medium text-muted-foreground">
                샘플 매장으로 테스트해 볼 수 있어요
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isStoreListOpen ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="text-muted-foreground pr-1"
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
              <div className="flex flex-col gap-2.5 pt-2">
                {stores.map((store) => (
                  <motion.div
                    key={store.storeId}
                    whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={`/order/${store.storeId}?table=${store.defaultTable}`}
                      className="block outline-none rounded-[20px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Card className="flex-row items-center justify-between gap-3 rounded-[20px] p-4 bg-card shadow-resting border-border transition-all hover:border-primary/40 hover:shadow-layered">
                        {/* Left: icon + info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                            <MapPin className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-base text-foreground">
                                {store.storeName}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-base px-2 py-0.5 font-bold border-none bg-muted text-muted-foreground rounded-full"
                              >
                                {store.branchKo}
                              </Badge>
                            </div>
                            <span className="text-base font-medium text-muted-foreground mt-1 truncate">
                              {store.addressKo} · {store.defaultTable}번 테이블
                            </span>
                          </div>
                        </div>

                        {/* Right: distance + chevron */}
                        <div className="flex items-center gap-1 shrink-0 pl-2">
                          <span className="text-base font-extrabold text-primary">
                            {store.distanceKo}
                          </span>
                          <ChevronRight
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <QrScannerModal
        open={isQrScannerOpen}
        onOpenChange={setIsQrScannerOpen}
      />
    </main>
  );
}
