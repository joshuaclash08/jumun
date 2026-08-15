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
import { useCartStore } from "@/store/useCartStore";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl font-bold">장바구니</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
          {items.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <span className="text-4xl opacity-20">🛒</span>
              <p className="text-muted-foreground">장바구니가 비어있습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">상품 ID: {item.productId}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-bold text-destructive underline"
                      aria-label="상품 삭제"
                    >
                      삭제
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    단가: {item.unitPrice.toLocaleString("ko-KR")}원
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-10 w-10 items-center justify-center text-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="수량 줄이기"
                      >
                        -
                      </button>
                      <span className="flex w-8 justify-center font-bold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-10 w-10 items-center justify-center text-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="수량 늘리기"
                      >
                        +
                      </button>
                    </div>
                    <span className="ml-auto font-bold text-lg">
                      {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DrawerFooter className="pt-2 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
          <Button
            size="lg"
            disabled={items.length === 0}
            className="h-16 w-full rounded-2xl text-lg font-bold"
            onClick={onCheckout}
          >
            {totalPrice.toLocaleString("ko-KR")}원 주문하기
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
