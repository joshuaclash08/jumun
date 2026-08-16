"use client";

import * as React from "react";
import { motion } from "motion/react";
import { CreditCard, Smartphone, Info } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup } from "@/components/settings/SettingsRow";
import { usePaymentStore, type PaymentMethod } from "@/store/usePaymentStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

const METHODS: { id: PaymentMethod; label: string; sublabel: string; icon: typeof CreditCard }[] = [
  { id: "card", label: "신용 / 체크카드", sublabel: "결제 시 카드로 진행돼요", icon: CreditCard },
  { id: "easy-pay", label: "간편 결제", sublabel: "Pay 앱으로 진행돼요", icon: Smartphone },
];

// Phase 1 has no real payment processing (PRODUCT.md) -- this only sets which
// mocked method CheckoutSheet preselects. No real card/account number is
// ever collected here, on purpose.
export default function PaymentSettingsPage() {
  const defaultMethod = usePaymentStore((state) => state.defaultMethod);
  const setDefaultMethod = usePaymentStore((state) => state.setDefaultMethod);
  const reducedMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-10">
      <SettingsHeader title="결제 수단 관리" description="주문 시 기본으로 선택될 결제 수단" />

      <div className="flex flex-col gap-4 px-4 pt-5">
        <SettingsGroup className="divide-y-0 flex flex-col gap-2 bg-transparent shadow-none p-0">
          {METHODS.map((method) => {
            const isSelected = defaultMethod === method.id;
            const Icon = method.icon;
            return (
              <motion.button
                key={method.id}
                type="button"
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                aria-pressed={isSelected}
                onClick={() => {
                  setDefaultMethod(method.id);
                  notify("success", `기본 결제 수단이 ${method.label}(으)로 설정되었습니다.`, {
                    hapticsEnabled,
                  });
                }}
                className={cn(
                  "flex items-center gap-3 rounded-[--radius-md] border-2 bg-card p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[--radius-sm]",
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className={cn("text-base font-bold", isSelected ? "text-primary" : "text-foreground")}>
                    {method.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{method.sublabel}</span>
                </div>
                <div
                  className={cn(
                    "h-5 w-5 shrink-0 rounded-full border-2",
                    isSelected ? "border-primary bg-primary" : "border-border"
                  )}
                  aria-hidden="true"
                />
              </motion.button>
            );
          })}
        </SettingsGroup>

        <div className="flex items-start gap-2 rounded-[--radius-md] bg-muted/60 p-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden="true" />
          <span>실제 결제는 진행되지 않는 프로토타입입니다. 여기서 고른 수단은 주문 시 화면에 미리 선택돼요.</span>
        </div>
      </div>
    </main>
  );
}
