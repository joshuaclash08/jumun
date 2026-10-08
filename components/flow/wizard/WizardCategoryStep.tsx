"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { MenuCategory, Product } from "@/lib/types";
import { MenuService } from "@/lib/services";
import { useTranslation } from "@/lib/i18n";

interface WizardCategoryStepProps {
  categories: MenuCategory[];
  products: Product[];
  onSelectCategory: (categoryId: string) => void;
  isMotionDisabled: boolean;
}

export function WizardCategoryStep({
  categories,
  products,
  onSelectCategory,
  isMotionDisabled,
}: WizardCategoryStepProps) {
  const { t, language } = useTranslation("menu");

  return (
    <motion.div
      key="step-1"
      initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
      className="flex flex-col gap-4 pt-4"
    >
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          {t("wizard.step1Title")}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className="group flex items-center justify-between p-5 rounded-2xl bg-card border-2 border-border/70 hover:border-primary focus-visible:border-primary hover:bg-accent/40 transition-all text-left shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {MenuService.getLocalizedTitle(cat, language)}
              </span>
              <span className="text-base font-medium text-muted-foreground">
                {t("wizard.itemsPrepared", {
                  count: products.filter((p) => p.category === cat.id).length,
                })}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Check className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
