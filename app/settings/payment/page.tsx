"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Info, Check, ShieldCheck } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsCard } from "@/components/settings/SettingsRow";
import { Button } from "@/components/ui/button";
import { usePaymentStore, type PaymentMethod } from "@/store/usePaymentStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

const METHODS = [
  {
    id: "card" as PaymentMethod,
    label: "신용 / 체크카드",
    sublabel: "주문 시 카드로 결제 진행",
    icon: CreditCard,
    iconBg: "bg-[#E8F3FF]",
    iconColor: "text-[#0064FF]",
  },
  {
    id: "easy-pay" as PaymentMethod,
    label: "간편 결제 (Pay)",
    sublabel: "Apple Pay, 토스페이, 카카오페이 등",
    icon: Smartphone,
    iconBg: "bg-[#FFE8EE]",
    iconColor: "text-[#F04452]",
  },
];

export default function PaymentSettingsPage() {
  const router = useRouter();
  const defaultMethod = usePaymentStore((state) => state.defaultMethod);
  const setDefaultMethod = usePaymentStore((state) => state.setDefaultMethod);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-32">
      <SettingsHeader title="결제 수단 관리" description="주문 시 기본으로 선택될 결제 수단" />

      <div className="flex flex-col gap-4 px-4 pt-5">
        <div className="flex items-center gap-3 rounded-[20px] bg-[#E8F3FF] p-4 text-[#0050D9] border border-[#0064FF]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0064FF]/15 text-[#0064FF]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">자동 기본값 저장</span>
            <span className="text-base font-medium text-muted-foreground mt-0.5">
              선택한 결제 수단은 다음 주문 시 자동으로 기본 선택돼요.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {METHODS.map((method) => {
            const isSelected = defaultMethod === method.id;
            return (
              <SettingsCard
                key={method.id}
                icon={method.icon}
                label={method.label}
                description={method.sublabel}
                iconBgClass={method.iconBg}
                iconColorClass={method.iconColor}
                isSelected={isSelected}
                ariaPressed={isSelected}
                onClick={() => {
                  setDefaultMethod(method.id);
                  notify("success", `기본 결제 수단이 ${method.label}(으)로 설정되었습니다.`, {
                    hapticsEnabled,
                  });
                }}
                trailing={
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected ? "border-primary bg-primary text-white" : "border-border bg-background"
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                }
              />
            );
          })}
        </div>

        <div className="flex items-start gap-2 rounded-[20px] bg-muted/60 p-4 text-base font-medium text-muted-foreground mt-2">
          <Info className="h-4 w-4 shrink-0 translate-y-0.5" aria-hidden="true" />
          <span>실제 카드번호를 수집하지 않는 안전한 모의 결제 방식입니다. 여기서 고른 수단이 주문 결제 화면에서 자동으로 활성화됩니다.</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-background/95 border-t border-border/60 p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="w-full max-w-[768px] px-2">
          <Button
            size="lg"
            onClick={() => router.back()}
            className="w-full font-extrabold bg-primary text-white shadow-none hover:bg-primary/95"
          >
            설정 완료
          </Button>
        </div>
      </div>
    </main>
  );
}
