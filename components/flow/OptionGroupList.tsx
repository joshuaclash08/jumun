"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { ProductOptionGroup } from "@/lib/types";
import { formatKRW } from "@/lib/format";
import { MenuService } from "@/lib/services";
import { cn } from "@/lib/utils";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";

export interface OptionGroupListProps {
  groups: ProductOptionGroup[];
  selections: Record<string, string[]>;
  onOptionToggle: (group: ProductOptionGroup, optionId: string) => void;
  className?: string;
}

export function OptionGroupList({
  groups,
  selections,
  onOptionToggle,
  className,
}: OptionGroupListProps) {
  const { t, language } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => {
        const selectedIds = selections[group.id] || [];
        const isSingle = group.selectionType === "single";
        const isSmallSingle = isSingle && group.options.length <= 4;
        const groupTitle = MenuService.getLocalizedTitle(group, language);
        const headingId = `option-group-heading-${group.id}`;

        return (
          <div key={group.id} className="flex flex-col gap-2.5">
            {/* Header: Title + Required Badge */}
            <div className="flex items-center gap-2 px-0.5">
              <h3
                id={headingId}
                className="text-base font-extrabold text-foreground"
              >
                {groupTitle}
              </h3>
              {group.required ? (
                <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-base font-extrabold text-secondary-foreground">
                  {t("productDetail.requiredBadge")}
                  <span className="sr-only">, {t("productDetail.requiredAria")}</span>
                </span>
              ) : (
                <span className="sr-only">, {t("productDetail.optionalAria")}</span>
              )}
            </div>

            {/* Hybrid UX: 2-column segmented chips for small single-choice groups */}
            {isSmallSingle ? (
              <div
                role="radiogroup"
                aria-labelledby={headingId}
                className="grid grid-cols-2 gap-2.5"
              >
                {group.options.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  const optTitle = MenuService.getLocalizedTitle(opt, language);
                  const priceDescription =
                    opt.priceDelta > 0
                      ? t("productDetail.extraPriceAria", {
                          price: formatKRW(opt.priceDelta),
                        })
                      : "";

                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${optTitle}${priceDescription}`}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => onOptionToggle(group, opt.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all font-bold text-base cursor-pointer min-h-[58px]",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/70 bg-card text-foreground hover:bg-muted/40",
                      )}
                    >
                      <span className="leading-tight text-center">{optTitle}</span>
                      {opt.priceDelta > 0 && (
                        <span className="text-base font-semibold opacity-85 mt-0.5 tabular-nums">
                          +{formatKRW(opt.priceDelta)}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* Multi-select or large lists: Toss Image 2 style with right-aligned circular indicator */
              <div
                role={isSingle ? "radiogroup" : "group"}
                aria-labelledby={headingId}
                className="flex flex-col divide-y divide-border/40 rounded-[20px] border border-border/60 bg-card overflow-hidden"
              >
                {group.options.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  const optTitle = MenuService.getLocalizedTitle(opt, language);
                  const priceDescription =
                    opt.priceDelta > 0
                      ? t("productDetail.extraPriceAria", {
                          price: formatKRW(opt.priceDelta),
                        })
                      : "";

                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      role={isSingle ? "radio" : "checkbox"}
                      aria-checked={isSelected}
                      aria-label={`${optTitle}${priceDescription}`}
                      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      onClick={() => onOptionToggle(group, opt.id)}
                      className={cn(
                        "flex items-center justify-between py-3.5 px-4 text-left transition-colors cursor-pointer min-h-[54px]",
                        isSelected ? "bg-primary/[0.06]" : "hover:bg-muted/30",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "text-base transition-colors",
                            isSelected
                              ? "font-extrabold text-foreground"
                              : "font-semibold text-foreground/90",
                          )}
                        >
                          {optTitle}
                        </span>
                        {opt.priceDelta > 0 && (
                          <span className="text-base font-semibold tabular-nums text-foreground/80">
                            +{formatKRW(opt.priceDelta)}
                          </span>
                        )}
                      </div>

                      {/* Right-aligned Circular Check Indicator */}
                      <div
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                          isSelected
                            ? "border-primary bg-primary text-white shadow-2xs"
                            : "border-muted-foreground/35 bg-background",
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
