"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { SettingsHeader, SettingsCard } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { usePaymentStore, type PaymentMethod } from "@/store/usePaymentStore";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { sanitizeReturnTo } from "@/lib/constants/setup";
import { cn } from "@/lib/utils";
import { useTranslation, translate, DEFAULT_LOCALE } from "@/lib/i18n";

const PAYMENT_METHODS: { id: PaymentMethod; key: "payment.methods.card" | "payment.methods.easyPay" }[] = [
  {
    id: "card",
    key: "payment.methods.card",
  },
  {
    id: "easy-pay",
    key: "payment.methods.easyPay",
  },
];

function PaymentSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams?.get?.("returnTo") ?? null;
  const returnTo = rawReturnTo ? sanitizeReturnTo(rawReturnTo) : null;

  const { t } = useTranslation("settings");
  const defaultMethod = usePaymentStore((state) => state.defaultMethod);
  const setDefaultMethod = usePaymentStore((state) => state.setDefaultMethod);

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col bg-background pb-28 sm:pb-32"
    >
      <SettingsHeader title={t("payment.title")} onBack={handleBack} />

      <div className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex flex-col gap-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = defaultMethod === method.id;
            return (
              <SettingsCard
                key={method.id}
                label={t(method.key)}
                isSelected={isSelected}
                ariaPressed={isSelected}
                onClick={() => {
                  setDefaultMethod(method.id);
                }}
                trailing={
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-input bg-card",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-4 w-4 stroke-[3.2]" />}
                  </div>
                }
              />
            );
          })}
        </div>
      </div>

      <StickyActionBar className="max-w-[840px]">
        <Button size="cta-full" onClick={handleBack}>
          {t("actions.complete")}
        </Button>
      </StickyActionBar>
    </main>
  );
}

export default function PaymentSettingsPage() {
  const loadingLabel = translate(DEFAULT_LOCALE, "common.loading");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label={loadingLabel}
          />
        </div>
      }
    >
      <PaymentSettingsContent />
    </Suspense>
  );
}

