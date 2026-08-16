"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Smartphone, TriangleAlert } from "lucide-react";
import { OrderService } from "@/lib/services";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import type { OrderType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

interface SelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  onKeyDown?: React.KeyboardEventHandler;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  reduceMotion: boolean;
}

/** Reusable accessible selection card — semantic <button> with press indicator */
function SelectionCard({
  isSelected,
  onClick,
  label,
  sublabel,
  icon,
  reduceMotion,
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "flex min-h-[72px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[--radius-md] border-2 p-3 font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-card text-foreground hover:bg-muted/40"
      )}
    >
      {icon && <span className="mb-0.5" aria-hidden="true">{icon}</span>}
      <span className="text-sm font-bold">{label}</span>
      {sublabel && (
        <span className={cn("text-xs font-medium", isSelected ? "text-primary/70" : "text-muted-foreground")}>
          {sublabel}
        </span>
      )}
    </motion.button>
  );
}

export function CheckoutSheet({ open, onOpenChange, onConfirm }: CheckoutSheetProps) {
  const { items, storeInfo, setOrderStatus, setLastReceipt, clearCart } = useCartStore();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const defaultPaymentMethod = usePaymentStore((state) => state.defaultMethod);
  const [orderType, setOrderType] = React.useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = React.useState<string>(defaultPaymentMethod);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };

  const handleCheckout = async () => {
    if (!storeInfo) {
      setErrorMessage("매장 정보가 확인되지 않았습니다. 다시 스캔해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setOrderStatus("submitting");

    try {
      const receipt = await OrderService.submitOrder(storeInfo, items, orderType);
      setLastReceipt(receipt);
      setOrderStatus("confirmed");
      clearCart();
      onOpenChange(false);
      onConfirm();
    } catch (err: unknown) {
      setOrderStatus("failed");
      const message = err instanceof Error ? err.message : "결제를 완료하지 못했어요.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b pb-3">
          <DrawerTitle>주문 및 결제</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
          <div className="flex flex-col gap-6 pb-4">
            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex flex-col gap-1 rounded-[--radius-md] bg-destructive/10 border border-destructive/30 p-4 text-destructive"
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
                <p className="text-sm opacity-90">
                  선택하신 장바구니 항목은 안전하게 유지됩니다. 다시 결제를 진행해 주세요.
                </p>
              </div>
            )}

            {/* 1. Dining Place */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-foreground">식사 장소</h3>
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard
                  isSelected={orderType === "dine-in"}
                  onClick={() => setOrderType("dine-in")}
                  label="매장 식사"
                  sublabel={`테이블 ${storeInfo?.table || "-"}번`}
                  reduceMotion={reduceMotion}
                />
                <SelectionCard
                  isSelected={orderType === "takeout"}
                  onClick={() => setOrderType("takeout")}
                  label="포장하기"
                  sublabel="픽업대 수령"
                  reduceMotion={reduceMotion}
                />
              </div>
            </div>

            {/* 2. Order Summary */}
            <Card className="flex flex-col gap-3 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">주문 내역 ({items.reduce((s, i) => s + i.quantity, 0)}개)</h3>
                <Badge variant="secondary" className="text-xs font-medium">{storeInfo?.storeName}</Badge>
              </div>

              <Separator />

              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">
                        {item.nameKo || item.productId} <span className="text-muted-foreground font-normal">x{item.quantity}</span>
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

              <Separator />

              <div className="flex items-center justify-between pt-1 text-base font-bold">
                <span className="text-foreground">결제 예정 금액</span>
                <span className="text-primary text-xl font-extrabold">{totalPrice.toLocaleString("ko-KR")}원</span>
              </div>
            </Card>

            {/* 3. Payment Method */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-foreground">결제 수단</h3>
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard
                  isSelected={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  label="신용 / 체크카드"
                  icon={<CreditCard className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                />
                <SelectionCard
                  isSelected={paymentMethod === "easy-pay"}
                  onClick={() => setPaymentMethod("easy-pay")}
                  label="간편 결제"
                  sublabel="Pay"
                  icon={<Smartphone className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                />
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-3 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
          <Button
            size="cta"
            disabled={isSubmitting || items.length === 0}
            className="w-full"
            onClick={handleCheckout}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                결제 승인 처리 중...
              </>
            ) : errorMessage ? (
              `${totalPrice.toLocaleString("ko-KR")}원 다시 결제하기`
            ) : (
              `${totalPrice.toLocaleString("ko-KR")}원 결제하기`
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
