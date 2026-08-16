"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ConfirmationStepProps {
  onReset: () => void;
}

export function ConfirmationStep({ onReset }: ConfirmationStepProps) {
  const lastReceipt = useCartStore((state) => state.lastReceipt);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduceMotion) return;

      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1a56b0", "#15803d", "#e5e7eb", "#b91c1c"],
        disableForReducedMotion: true,
      });

      // Animate receipt in with GSAP timeline
      gsap.from(".receipt-element", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.08,
      });
    },
    { scope: containerRef }
  );

  if (!lastReceipt) {
    return null;
  }

  const orderTypeLabel = lastReceipt.orderType === "dine-in" ? "매장 식사" : "포장";
  const formattedTime = new Date(lastReceipt.placedAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={containerRef}
      className="flex min-h-[85vh] flex-col items-center justify-center p-4 py-8 text-center"
    >
      <div className="receipt-element mb-6 flex flex-col items-center gap-2">
        {/* Success icon — Jumun primary palette, no emoji */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10 stroke-[1.5]" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">주문이 완료되었어요!</h1>
        <p className="text-base text-muted-foreground">
          주문번호 <span className="text-2xl font-extrabold text-foreground ml-1">{lastReceipt.orderNumber}</span>
        </p>
      </div>

      <Card className="receipt-element w-full max-w-sm p-5 shadow-xs text-left">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">주문 영수증</h2>
            <p className="text-xs text-muted-foreground">
              {lastReceipt.store.storeName} · {lastReceipt.store.table}번 테이블 · {formattedTime}
            </p>
          </div>
          <Badge variant="secondary" className="font-bold">
            {orderTypeLabel}
          </Badge>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col gap-3 py-1">
          {lastReceipt.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-foreground">
                  {item.nameKo || item.productId}{" "}
                  <span className="text-muted-foreground font-normal">x{item.quantity}</span>
                </span>
                {item.optionsSummary && (
                  <span className="text-xs text-muted-foreground">
                    {item.optionsSummary}
                  </span>
                )}
              </div>
              <span className="font-bold text-foreground">
                {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="pt-2 flex justify-between text-base font-bold">
          <span className="text-foreground">총 결제 금액</span>
          <span className="text-primary text-xl font-extrabold">
            {lastReceipt.total.toLocaleString("ko-KR")}원
          </span>
        </div>
      </Card>

      <Button
        size="cta"
        className="receipt-element mt-8 w-full max-w-sm"
        onClick={onReset}
      >
        새로운 주문하기
      </Button>
    </div>
  );
}
