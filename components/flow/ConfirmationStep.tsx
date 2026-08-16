"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SuccessCheckIllustration } from "@/components/ui/TossIllustrations";
import confetti from "canvas-confetti";

interface ConfirmationStepProps {
  onReset: () => void;
}

// Receipt content staggers in as one group (Motion variant propagation --
// see docs/decisions/0009-motion-only-animation.md for why this replaced a
// GSAP timeline: this stagger+the icon's spring-pop below are both fully
// expressible in Motion's own variant system, so a second animation library
// bought nothing but bundle weight for a single call site).
const receiptContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const receiptItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
// The success icon gets its own, more celebratory entrance -- a springy
// pop rather than the receipt's plain fade+rise -- because this is the one
// moment in the product that's meant to feel like a small celebration, not
// a neutral state change (content-appropriate motion, not one animation
// recipe reused everywhere regardless of what it's attached to).
const successPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
};

export function ConfirmationStep({ onReset }: ConfirmationStepProps) {
  const lastReceipt = useCartStore((state) => state.lastReceipt);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  React.useEffect(() => {
    if (reduceMotion || !lastReceipt) return;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#0064ff", "#00a85a", "#ff9500", "#e8f3ff"],
      disableForReducedMotion: true,
    });
  }, [lastReceipt, reduceMotion]);

  if (!lastReceipt) {
    return null;
  }

  const orderTypeLabel = lastReceipt.orderType === "dine-in" ? "매장 식사" : "포장하기";
  const formattedTime = new Date(lastReceipt.placedAt).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={reduceMotion ? "visible" : "hidden"}
      animate="visible"
      variants={receiptContainer}
      className="flex min-h-screen w-full flex-col items-center justify-between p-4 pt-8 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center bg-background"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <motion.div
          variants={reduceMotion ? undefined : successPop}
          className="flex flex-col items-center gap-1.5"
        >
          {/* Success icon — Toss signature celebration check graphic */}
          <SuccessCheckIllustration size={84} />

          <h1 className="text-2xl font-extrabold text-foreground mt-1">
            주문이 완료되었어요!
          </h1>
          <div className="flex items-center gap-1.5 text-base font-semibold text-muted-foreground">
            <span>주문번호</span>
            <span className="text-2xl font-black text-primary ml-1 tabular-nums">
              {lastReceipt.orderNumber}
            </span>
          </div>
        </motion.div>

        <motion.div variants={reduceMotion ? undefined : receiptItem} className="w-full">
        <Card className="w-full p-5 rounded-[22px] shadow-resting border-border text-left">
          <div className="flex items-center justify-between pb-2.5">
            <div>
              <h2 className="text-base font-bold text-foreground">주문 영수증</h2>
              <p className="text-base font-medium text-muted-foreground mt-0.5">
                {lastReceipt.store.storeName} ·{" "}
                {lastReceipt.store.orderType === "dine-in"
                  ? `${lastReceipt.store.table}번 테이블`
                  : "포장"}{" "}
                · {formattedTime}
              </p>
            </div>
            <Badge variant="secondary" className="font-bold text-base px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border-none">
              {orderTypeLabel}
            </Badge>
          </div>

          <Separator className="my-2" />

          <div className="flex flex-col gap-2.5 py-1">
            {lastReceipt.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-base">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">
                    {item.nameKo || item.productId}{" "}
                    <span className="text-muted-foreground font-medium">x{item.quantity}</span>
                  </span>
                  {item.optionsSummary && (
                    <span className="text-base text-muted-foreground font-medium">
                      {item.optionsSummary}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-foreground tabular-nums">
                  {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          <div className="pt-2 flex justify-between items-center text-base font-bold">
            <span className="text-foreground">총 결제 금액</span>
            <span className="text-primary text-xl font-black tabular-nums">
              {lastReceipt.total.toLocaleString("ko-KR")}원
            </span>
          </div>
        </Card>
        </motion.div>
      </div>

      <motion.div
        variants={reduceMotion ? undefined : receiptItem}
        className="w-full max-w-sm pt-6"
      >
        <Button
          size="lg"
          className="w-full h-14 min-h-[56px] font-bold rounded-[16px]"
          onClick={onReset}
        >
          새로운 주문하기
        </Button>
      </motion.div>
    </motion.div>
  );
}
