"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, MapPin, ChevronRight, Store, QrCode } from "lucide-react";
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
      className="flex min-h-screen w-full flex-col items-center bg-background text-foreground overflow-y-auto"
    >
      {/* ── Sticky Hero Section ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm border-b border-border/0 flex flex-col items-center pt-10 pb-6 px-4 gap-4">
        {/* Animated NFC/QR Visual */}
        <LandingHeroVisual />

        {/* Copy */}
        <div className="flex flex-col gap-1.5 text-center max-w-xs px-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
            테이블 태그에 폰을 대거나<br />QR 코드를 스캔하세요
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            앱 설치 없이 바로 연결돼요
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsQrScannerOpen(true)}
          className="gap-1.5 font-semibold text-primary hover:bg-primary/10"
        >
          <QrCode className="h-4 w-4" aria-hidden="true" />
          카메라로 QR 스캔해보기
        </Button>
      </div>

      <QrScannerModal open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen} />

      {/* ── Store Selector ──────────────────────────────────────── */}
      <div className="w-full px-4 pt-5 pb-10">
        {/* Collapsible trigger row */}
        <button
          type="button"
          onClick={() => setIsStoreListOpen((prev) => !prev)}
          aria-expanded={isStoreListOpen}
          aria-controls="available-stores-list"
          className="w-full flex items-center justify-between py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[--radius-sm]"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-sm] bg-primary/10 text-primary">
              <Store className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-foreground">직접 매장 선택</span>
          </div>
          <motion.div
            animate={{ rotate: isStoreListOpen ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </motion.div>
        </button>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

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
              <div className="flex flex-col gap-2 pt-1">
                {stores.map((store) => (
                  <motion.div
                    key={store.storeId}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={`/order/${store.storeId}?table=${store.defaultTable}`}
                      className="block outline-none rounded-[--radius-md] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Card className="flex-row items-center justify-between gap-3 rounded-[--radius-md] p-3 shadow-xs transition-colors hover:bg-accent/30">
                        {/* Left: icon + info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[--radius-sm] bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-foreground">
                                {store.storeName}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-semibold border-border shrink-0"
                              >
                                {store.branchKo}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground mt-0.5 truncate">
                              {store.addressKo} · {store.defaultTable}번 테이블
                            </span>
                          </div>
                        </div>

                        {/* Right: distance + chevron */}
                        <div className="flex items-center gap-1 shrink-0 pl-3 text-muted-foreground">
                          <span className="text-xs font-bold text-primary">{store.distanceKo}</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
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
    </main>
  );
}
