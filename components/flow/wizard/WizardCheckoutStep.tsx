"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ArrowLeft, CreditCard, Smartphone, Loader2 } from "lucide-react";
import type { CartItem, StoreInfo } from "@/lib/types";
import { formatKRW, getCartItemDisplayName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectionCard } from "@/components/flow/SelectionCard";
import { useTranslation } from "@/lib/i18n";

interface WizardCheckoutStepProps {
  storeInfo?: StoreInfo;
  items: CartItem[];
  cartTotal: number;
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (method: string) => void;
  onFinalPayment: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isMotionDisabled: boolean;
  reducedMotion: boolean;
}

export function WizardCheckoutStep({
  storeInfo,
  items,
  cartTotal,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onFinalPayment,
  onBack,
  isSubmitting,
  isMotionDisabled,
  reducedMotion,
}: WizardCheckoutStepProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");

  return (
    <motion.div
      key="step-4"
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
          aria-label={tCommon("back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {t("wizard.step4Title")}
          </h1>
        </div>
      </div>

      {/* Store and Table Details */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-base">
        <span className="font-bold text-foreground">
          {storeInfo?.storeName || t("wizard.defaultStore")}
        </span>
        <Badge variant="outline" className="font-bold text-base">
          {storeInfo?.orderType === "dine-in"
            ? tCommon("tableNumber", { table: storeInfo.table })
            : t("wizard.takeoutOrder")}
        </Badge>
      </div>

      {/* Item List Summary */}
      <div className="flex flex-col gap-2.5">
        <span className="text-base font-bold text-foreground">
          {t("wizard.orderedMenuList")}
        </span>
        <div className="flex flex-col gap-2 rounded-2xl bg-card border border-border/70 p-4 divide-y divide-border/40">
          {items.map((it) => (
            <div
              key={it.id}
              className="pt-2 first:pt-0 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">
                  {getCartItemDisplayName(it)}
                </span>
                {it.optionsSummary && (
                  <span className="text-base text-muted-foreground">
                    {it.optionsSummary}
                  </span>
                )}
                <span className="text-base font-semibold text-muted-foreground mt-0.5">
                  {t("wizard.itemQuantity", { quantity: it.quantity })}
                </span>
              </div>
              <span className="text-base font-extrabold text-foreground tabular-nums">
                {formatKRW(it.unitPrice * it.quantity)}
              </span>
            </div>
          ))}

          <div className="pt-3 flex items-center justify-between">
            <span className="text-base font-black text-foreground">
              {t("receipt.totalAmount")}
            </span>
            <span className="text-xl font-black text-primary tabular-nums">
              {formatKRW(cartTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector — Reusing SelectionCard */}
      <div className="flex flex-col gap-2.5">
        <span className="text-base font-bold text-foreground">
          {t("checkout.paymentMethod")}
        </span>
        <div
          role="radiogroup"
          aria-label={t("checkout.paymentMethod")}
          className="grid grid-cols-2 gap-2"
        >
          <SelectionCard
            role="radio"
            isSelected={selectedPaymentMethod === "card"}
            onClick={() => onSelectPaymentMethod("card")}
            label={t("wizard.creditCard")}
            icon={<CreditCard className="w-5 h-5" />}
            reduceMotion={reducedMotion}
          />
          <SelectionCard
            role="radio"
            isSelected={selectedPaymentMethod === "easy-pay"}
            onClick={() => onSelectPaymentMethod("easy-pay")}
            label={t("wizard.tossPay")}
            icon={<Smartphone className="w-5 h-5" />}
            reduceMotion={reducedMotion}
          />
        </div>
      </div>

      {/* Final Checkout Button */}
      <Button
        size="cta-full"
        disabled={isSubmitting || items.length === 0}
        onClick={onFinalPayment}
        className="h-15 text-lg font-black bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-md cursor-pointer mt-2"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("wizard.paymentProcessing")}</span>
          </div>
        ) : (
          <span>{t("wizard.payTotalButton", { total: formatKRW(cartTotal) })}</span>
        )}
      </Button>
    </motion.div>
  );
}
