"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SettingsHeader, SettingsCard } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { usePaymentStore, type PaymentMethod } from "@/store/usePaymentStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { cn } from "@/lib/utils";

const METHODS = [
  {
    id: "card" as PaymentMethod,
    label: "신용 / 체크카드",
  },
  {
    id: "easy-pay" as PaymentMethod,
    label: "간편 결제",
  },
];

export default function PaymentSettingsPage() {
  const router = useRouter();
  const defaultMethod = usePaymentStore((state) => state.defaultMethod);
  const setDefaultMethod = usePaymentStore((state) => state.setDefaultMethod);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col bg-background pb-28 sm:pb-32"
    >
      <SettingsHeader title="결제 수단 관리" />

      <div className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex flex-col gap-3">
          {METHODS.map((method) => {
            const isSelected = defaultMethod === method.id;
            return (
              <SettingsCard
                key={method.id}
                label={method.label}
                isSelected={isSelected}
                ariaPressed={isSelected}
                onClick={() => {
                  setDefaultMethod(method.id);
                  toast({
                    kind: "success",
                    messageKo: `기본 결제 수단이 ${method.label}(으)로 설정되었습니다.`,
                    variant: "generic",
                    hapticsEnabled,
                  });
                }}
                trailing={
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-input bg-white",
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

      <StickyActionBar className="max-w-[768px]">
        <Button size="cta-full" onClick={() => router.back()}>
          설정 완료
        </Button>
      </StickyActionBar>
    </main>
  );
}
