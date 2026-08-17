"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { formatKRW } from "@/lib/format";
import confetti from "canvas-confetti";

interface ConfirmationStepProps {
  onReset: () => void;
}

// Receipt content staggers in with smooth Toss spring easing
const receiptContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};

const receiptItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

function FluidSuccessCheck({ size = 76 }: { size?: number }) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <div
      className="relative flex items-center justify-center select-none shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer soft blue aura ring */}
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 rounded-full bg-primary/10"
      />

      {/* Main vibrant Toss Blue circle with spring pop */}
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 22,
          delay: reduceMotion ? 0 : 0.05,
        }}
        className="relative flex items-center justify-center rounded-full bg-primary shadow-sm"
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        <svg
          width={size * 0.42}
          height={size * 0.42}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M4.5 12.5L9.5 17.5L19.5 6.5"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: [0.22, 1, 0.36, 1],
              delay: reduceMotion ? 0 : 0.15,
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function ConfirmationStep({ onReset }: ConfirmationStepProps) {
  const router = useRouter();
  const lastReceipt = useCartStore((state) => state.lastReceipt);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  React.useEffect(() => {
    if (reduceMotion || !lastReceipt) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.45 },
      colors: ["#0064ff", "#00a85a", "#ff9500", "#e8f3ff"],
      disableForReducedMotion: true,
    });
  }, [lastReceipt, reduceMotion]);

  if (!lastReceipt) {
    return null;
  }

  const handleNewOrder = () => {
    const { store } = lastReceipt;
    const href =
      store.orderType === "dine-in"
        ? `/order/${store.storeId}?table=${store.table}`
        : `/order/${store.storeId}?type=takeout`;
    onReset();
    router.push(href);
  };

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
      className="flex min-h-[calc(100dvh-56px)] w-full flex-col justify-between px-4 pt-3 pb-0 text-center bg-background"
    >
      {/* Centered Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3.5 sm:gap-4 w-full max-w-sm mx-auto py-1">
        {/* Top Celebration Section */}
        <motion.div
          variants={receiptItem}
          className="flex flex-col items-center gap-1"
        >
          <FluidSuccessCheck size={72} />

          <h1 className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight mt-0.5">
            주문이 완료되었어요!
          </h1>

          {/* Large Hero Order Number Display */}
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <span className="text-xs sm:text-sm font-bold text-muted-foreground">
              주문번호
            </span>
            <span className="text-4xl sm:text-5xl font-black text-primary tabular-nums tracking-tight">
              {lastReceipt.orderNumber}
            </span>
          </div>
        </motion.div>

        {/* Receipt Card */}
        <motion.div variants={receiptItem} className="w-full">
          <Card className="w-full p-4 sm:p-5 rounded-[22px] shadow-resting border-border/80 text-left bg-card">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-extrabold text-foreground">주문 영수증</h2>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  {lastReceipt.store.storeName} ·{" "}
                  {lastReceipt.store.orderType === "dine-in"
                    ? `${lastReceipt.store.table}번 테이블`
                    : "포장"}{" "}
                  · {formattedTime}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="font-extrabold text-sm px-2.5 py-0.5"
              >
                {orderTypeLabel}
              </Badge>
            </div>

            <Separator className="my-2 bg-border/60" />

            <div className="flex flex-col gap-2 py-0.5">
              {lastReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-base">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                      {item.nameKo || item.productId}{" "}
                      <span className="text-muted-foreground font-medium text-sm">
                        x{item.quantity}
                      </span>
                    </span>
                    {item.optionsSummary && (
                      <span className="text-sm text-muted-foreground font-medium">
                        {item.optionsSummary}
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-foreground tabular-nums text-base">
                    {formatKRW(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-2 bg-border/60" />

            <div className="pt-1 flex justify-between items-center text-base font-bold">
              <span className="text-foreground">총 결제 금액</span>
              <span className="text-primary text-xl sm:text-2xl font-black tabular-nums tracking-tight">
                {formatKRW(lastReceipt.total)}
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Fixed/Sticky Bottom Action Bar — Always visible without scrolling */}
      <StickyActionBar>
        <motion.div variants={receiptItem}>
          <Button size="cta-full" className="max-w-sm mx-auto" onClick={handleNewOrder}>
            새로운 주문하기
          </Button>
        </motion.div>
      </StickyActionBar>
    </motion.div>
  );
}
