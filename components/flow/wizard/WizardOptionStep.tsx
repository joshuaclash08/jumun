"use client";

import * as React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Product, ProductOptionGroup } from "@/lib/types";
import { formatKRW } from "@/lib/format";
import { MenuService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { OptionGroupList } from "@/components/flow/OptionGroupList";
import { useTranslation } from "@/lib/i18n";

interface WizardOptionStepProps {
  product: Product;
  currentUnitPrice: number;
  quantity: number;
  optionSelections: Record<string, string[]>;
  onOptionToggle: (group: ProductOptionGroup, optionId: string) => void;
  onQuantityChange: (qty: number) => void;
  onProceedToCheckout: () => void;
  onAddMoreItems: () => void;
  onBack: () => void;
  isMotionDisabled: boolean;
}

export function WizardOptionStep({
  product,
  currentUnitPrice,
  quantity,
  optionSelections,
  onOptionToggle,
  onQuantityChange,
  onProceedToCheckout,
  onAddMoreItems,
  onBack,
  isMotionDisabled,
}: WizardOptionStepProps) {
  const { t, language } = useTranslation("menu");

  return (
    <motion.div
      key="step-3"
      initial={isMotionDisabled ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={isMotionDisabled ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: isMotionDisabled ? 0 : 0.15 }}
      className="flex flex-col gap-5 pt-4"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={t("wizard.backToMenuAria")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {MenuService.getLocalizedTitle(product, language)}
          </h1>
        </div>
      </div>

      {/* Selected Product Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
          <Image
            src={product.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">
            {MenuService.getLocalizedTitle(product, language)}
          </h2>
          <span className="text-base font-extrabold text-primary">
            {formatKRW(currentUnitPrice * quantity)}
          </span>
        </div>
      </div>

      {/* Unified Option Groups via OptionGroupList */}
      {product.optionGroups && product.optionGroups.length > 0 && (
        <OptionGroupList
          groups={product.optionGroups}
          selections={optionSelections}
          onOptionToggle={onOptionToggle}
        />
      )}

      {/* Tactile Quantity Stepper */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70">
        <span className="text-base font-bold text-foreground">
          {t("wizard.orderQuantity")}
        </span>
        <QuantityStepper
          value={quantity}
          onIncrement={() => onQuantityChange(Math.min(10, quantity + 1))}
          onDecrement={() => onQuantityChange(Math.max(1, quantity - 1))}
          min={1}
          max={10}
          itemLabel={t("wizard.orderQuantity")}
        />
      </div>

      {/* Bottom Step 3 Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-2">
        <Button
          size="cta-full"
          onClick={onProceedToCheckout}
          className="h-14 text-base font-black bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-sm cursor-pointer"
        >
          {t("wizard.directPayButton", {
            price: formatKRW(currentUnitPrice * quantity),
          })}
        </Button>
        <Button
          variant="outline"
          onClick={onAddMoreItems}
          className="h-13 text-base font-bold rounded-2xl border-2 border-border/80 hover:bg-muted/60 cursor-pointer"
        >
          {t("wizard.addMoreButton")}
        </Button>
      </div>
    </motion.div>
  );
}
