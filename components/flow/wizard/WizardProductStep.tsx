"use client";

import * as React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { MenuCategory, Product } from "@/lib/types";
import { formatKRW } from "@/lib/format";
import { MenuService } from "@/lib/services";
import { useTranslation } from "@/lib/i18n";

interface WizardProductStepProps {
  selectedCategory: MenuCategory | undefined;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBack: () => void;
  isMotionDisabled: boolean;
}

export function WizardProductStep({
  selectedCategory,
  products,
  onSelectProduct,
  onBack,
  isMotionDisabled,
}: WizardProductStepProps) {
  const { t, language } = useTranslation("menu");

  return (
    <motion.div
      key="step-2"
      initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
      className="flex flex-col gap-4 pt-4"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={t("wizard.backToCategoryAria")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {t("wizard.step2Title", {
              category: selectedCategory
                ? MenuService.getLocalizedTitle(selectedCategory, language)
                : "",
            })}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        {products.map((prod) => (
          <button
            key={prod.id}
            type="button"
            onClick={() => onSelectProduct(prod)}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-border/70 hover:border-primary focus-visible:border-primary hover:bg-accent/40 transition-all text-left shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-muted/60 shrink-0">
              <Image
                src={prod.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="72px"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {MenuService.getLocalizedTitle(prod, language)}
              </span>
              <span className="text-base font-extrabold text-foreground mt-0.5">
                {formatKRW(prod.price)}
              </span>
              <span className="text-base font-medium text-muted-foreground mt-1 line-clamp-1">
                {MenuService.getLocalizedDescription(prod, language)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
