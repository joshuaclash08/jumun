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
import { Loader2, CreditCard, Smartphone, TriangleAlert, Utensils, ShoppingBag, Check, ChevronLeft } from "lucide-react";
import { OrderService } from "@/lib/services";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { RollingPrice } from "@/components/ui/RollingPrice";
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
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  reduceMotion: boolean;
}

/** Reusable accessible selection card — semantic <button> with Toss style press indicator */
function SelectionCard({
  isSelected,
  onClick,
  label,
  sublabel,
  icon,
  reduceMotion,
}: SelectionCardProps) {
  const fullLabel = sublabel ? `${label}, ${sublabel}` : label;

  return (
    <motion.button
      type="button"
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={fullLabel}
      className={cn(
        "relative flex min-h-[80px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[18px] border-2 p-3.5 font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary bg-primary/5 text-primary shadow-2xs"
          : "border-border bg-card text-foreground hover:bg-muted/30"
      )}
    >
      <div className="flex flex-col items-center justify-center gap-1 pointer-events-none" aria-hidden="true">
        {isSelected && (
          <motion.div
            initial={reduceMotion ? undefined : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </motion.div>
        )}
        {icon && <span className="mb-0.5">{icon}</span>}
        <span className="text-base font-bold leading-tight">{label}</span>
        {sublabel && (
          <span className={cn("text-base font-medium", isSelected ? "text-primary/80" : "text-muted-foreground")}>
            {sublabel}
          </span>
        )}
      </div>
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
        <DrawerHeader className="relative border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.90 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                aria-label="주문 및 결제 닫기"
                className="h-12 w-12 rounded-full text-foreground hover:bg-muted -ml-1.5"
              >
                <ChevronLeft className="h-7 w-7 stroke-[2.8]" aria-hidden="true" />
              </Button>
            </motion.div>
            <DrawerTitle className="text-xl font-extrabold text-foreground">주문 및 결제</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
          <div className="flex flex-col gap-6 pb-4">
            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex flex-col gap-1 rounded-[18px] bg-destructive/10 border border-destructive/30 p-4 text-destructive"
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
                <p className="text-base opacity-90 font-medium">
                  선택하신 장바구니 항목은 안전하게 유지됩니다. 다시 결제를 진행해 주세요.
                </p>
              </div>
            )}

            {/* 1. Dining Place */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-base font-bold text-foreground">식사 장소</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <SelectionCard
                  isSelected={orderType === "dine-in"}
                  onClick={() => setOrderType("dine-in")}
                  label="매장 식사"
                  sublabel={`테이블 ${storeInfo?.table || "-"}번`}
                  icon={<Utensils className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                />
                <SelectionCard
                  isSelected={orderType === "takeout"}
                  onClick={() => setOrderType("takeout")}
                  label="포장하기"
                  sublabel="픽업대 수령"
                  icon={<ShoppingBag className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                />
              </div>
            </div>

            {/* 2. Order Summary */}
            <Card className="flex flex-col gap-3 p-4.5 rounded-[22px] shadow-resting border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">주문 내역 ({items.reduce((s, i) => s + i.quantity, 0)}개)</h3>
                <Badge variant="secondary" className="text-base font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border-none">
                  {storeInfo?.storeName}
                </Badge>
              </div>

              <Separator />

              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between text-base">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">
                        {item.nameKo || item.productId} <span className="text-muted-foreground font-medium">x{item.quantity}</span>
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

              <Separator />

              <div className="flex items-center justify-between pt-1 text-base font-bold">
                <span className="text-foreground">결제 예정 금액</span>
                <RollingPrice
                  value={totalPrice}
                  suffix="원"
                  className="text-primary text-xl font-black"
                />
              </div>
            </Card>

            {/* 3. Payment Method */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-base font-bold text-foreground">결제 수단</h3>
              <div className="grid grid-cols-2 gap-2.5">
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

        <DrawerFooter className="p-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-border bg-background">
          <Button
            size="cta"
            disabled={isSubmitting || items.length === 0}
            className="w-full font-bold text-base rounded-[16px]"
            onClick={handleCheckout}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                결제 승인 처리 중...
              </>
            ) : errorMessage ? (
              <RollingPrice
                value={totalPrice}
                suffix="원 다시 결제하기"
                className="font-bold text-base text-primary-foreground"
              />
            ) : (
              <RollingPrice
                value={totalPrice}
                suffix="원 결제하기"
                className="font-bold text-base text-primary-foreground"
              />
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
