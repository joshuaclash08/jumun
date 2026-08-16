"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b pb-3">
          <DrawerTitle>장바구니</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
          {items.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <ShoppingCart className="h-7 w-7 stroke-[1.5]" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">장바구니가 비어 있어요.</p>
              <Button
                variant="outline"
                className="mt-2 rounded-xl px-6 font-semibold"
                onClick={() => onOpenChange(false)}
              >
                메뉴 둘러보기
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  >
                    <Card className="flex flex-col gap-2 p-4 shadow-resting">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-card-foreground">
                            {item.nameKo || item.productId}
                          </span>
                          {item.optionsSummary && (
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.optionsSummary}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 text-sm font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`${item.nameKo || '상품'} 장바구니에서 삭제`}
                        >
                          삭제
                        </Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        단가: {item.unitPrice.toLocaleString("ko-KR")}원
                      </div>

                      <Separator className="my-1" />

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center rounded-full border border-border bg-muted/40">
                          <motion.button
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-11 w-11 items-center justify-center text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                            aria-label={`${item.nameKo || '상품'} 수량 1개 줄이기`}
                          >
                            -
                          </motion.button>
                          <span
                            className="flex w-8 justify-center font-bold text-foreground"
                            aria-live="polite"
                            aria-label={`현재 수량 ${item.quantity}개`}
                          >
                            {item.quantity}
                          </span>
                          <motion.button
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-11 w-11 items-center justify-center text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                            aria-label={`${item.nameKo || '상품'} 수량 1개 늘리기`}
                          >
                            +
                          </motion.button>
                        </div>

                        <span className="font-bold text-lg text-foreground">
                          {(item.unitPrice * item.quantity).toLocaleString("ko-KR")}원
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DrawerFooter className="pt-3 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
          <Button
            size="cta"
            disabled={items.length === 0}
            className="w-full"
            onClick={onCheckout}
          >
            {totalPrice.toLocaleString("ko-KR")}원 주문하기
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
