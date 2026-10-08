"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Store } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import type { StoreListing } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface StoreSelectorListProps {
  stores: StoreListing[];
}

/**
 * Collapsible Store Selector Accordion and Store Card List.
 * Clean, accessible list allowing users to pick a venue manually from the landing page.
 */
export function StoreSelectorList({ stores }: StoreSelectorListProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const language = useAccessibilityStore((state) => state.language);
  const { t } = useTranslation("landing");

  return (
    <div className="w-full max-w-md pt-1 pb-2">
      {/* Collapsible Trigger Row */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="available-stores-list"
        className="w-full flex items-center justify-between py-3 px-3.5 text-left rounded-[16px] bg-muted/40 hover:bg-muted/70 active:bg-muted/80 active:scale-[0.99] border border-border/40 transition-all cursor-pointer touch-manipulation select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-background text-foreground shadow-xs border border-border/40">
            <Store className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-foreground">
              {t("selectStoreDirectly")}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "text-muted-foreground pr-0.5 transition-transform duration-200 ease-out",
            isOpen && "rotate-180",
          )}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </button>

      {/* Expandable Store List */}
      <AnimatePresence>
        {isOpen && (
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
            aria-label={t("availableStoresAria")}
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
                    className="block rounded-[16px]"
                  >
                    <div className="flex items-center justify-between gap-3 rounded-[16px] p-3.5 bg-card border border-border/60 hover:border-border hover:bg-muted/30 transition-all">
                      {/* Left: icon + name/branch + address */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-base text-foreground truncate leading-tight">
                              {store.storeName}
                            </span>
                            <span className="shrink-0 text-base font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-[6px]">
                              {language === "en" && store.branchEn
                                ? store.branchEn
                                : store.branchKo}
                            </span>
                          </div>
                          <span className="text-base font-medium text-muted-foreground truncate mt-1">
                            {language === "en" && store.addressEn
                              ? store.addressEn
                              : store.addressKo}
                          </span>
                        </div>
                      </div>

                      {/* Right: distance badge + chevron */}
                      <div className="flex items-center gap-1.5 shrink-0 pl-1">
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
  );
}
