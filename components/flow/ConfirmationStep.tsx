"use client";

import * as React from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
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
        colors: ["#1a56b0", "#146c3b", "#fbf9f5", "#a32118"],
        disableForReducedMotion: true,
      });

      // Animate receipt in
      gsap.from(".receipt-card", {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.1,
      });
    },
    { scope: containerRef }
  );

  if (!lastReceipt) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="receipt-card mb-8 flex flex-col items-center gap-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
          <span className="text-4xl" aria-hidden="true">🎉</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">주문 완료!</h1>
        <p className="text-lg text-muted-foreground">
          주문번호 <span className="font-bold text-foreground">{lastReceipt.orderNumber}</span>
        </p>
      </div>

      <div className="receipt-card w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[0_1px_2px_rgba(33,30,26,0.06),_0_1px_1px_rgba(33,30,26,0.04)] text-left">
        <h2 className="mb-4 text-lg font-bold border-b pb-2">주문 내역</h2>
        <div className="flex flex-col gap-3">
          {lastReceipt.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                상품 {item.productId} <span className="text-muted-foreground">x{item.quantity}</span>
              </span>
              <span className="font-semibold">
                {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t pt-4 flex justify-between text-lg font-bold">
          <span>총 결제 금액</span>
          <span className="text-primary">
            {lastReceipt.total.toLocaleString("ko-KR")}원
          </span>
        </div>
      </div>

      <Button
        size="lg"
        className="receipt-card mt-12 h-16 w-full max-w-sm rounded-2xl text-lg font-bold"
        onClick={onReset}
      >
        새로운 주문하기
      </Button>
    </div>
  );
}
