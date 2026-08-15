"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { OrderService } from "@/lib/services";
import { useCartStore } from "@/store/useCartStore";
import type { OrderType } from "@/lib/types";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CheckoutSheet({ open, onOpenChange, onConfirm }: CheckoutSheetProps) {
  const { items, storeInfo, setOrderStatus, setLastReceipt, clearCart } = useCartStore();
  const [orderType, setOrderType] = React.useState<OrderType>("dine-in");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCheckout = async () => {
    if (!storeInfo) {
      console.error("StoreInfo is missing");
      return;
    }
    setIsSubmitting(true);
    setOrderStatus("submitting");

    try {
      const receipt = await OrderService.submitOrder(storeInfo, items, orderType);
      setLastReceipt(receipt);
      setOrderStatus("confirmed");
      clearCart();
      onConfirm();
    } catch (e) {
      setOrderStatus("failed");
      console.error(e);
      // Fallback/retry logic handled here
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl font-bold">결제 진행</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-6 px-4 py-4">
          <h3 className="text-lg font-bold">식사 장소</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setOrderType("dine-in")}
              className={`flex-1 rounded-2xl border-2 p-6 font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                orderType === "dine-in"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              매장 식사
            </button>
            <button
              onClick={() => setOrderType("takeout")}
              className={`flex-1 rounded-2xl border-2 p-6 font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                orderType === "takeout"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              포장
            </button>
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
          <Button
            size="lg"
            disabled={isSubmitting}
            className="h-16 w-full rounded-2xl text-lg font-bold"
            onClick={handleCheckout}
          >
            {isSubmitting ? "결제 처리 중..." : "결제하기"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
