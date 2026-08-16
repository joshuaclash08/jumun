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
import { Plus, Minus, Trash2, ChevronLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { EmptyCartIllustration } from "@/components/ui/TossIllustrations";
import { RollingPrice } from "@/components/ui/RollingPrice";

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
                onClick={() => onOpenChange(false)}
                aria-label="장바구니 닫기"
                className="h-12 w-12 rounded-full text-foreground hover:bg-muted -ml-1.5"
              >
                <ChevronLeft className="h-7 w-7 stroke-[2.8]" aria-hidden="true" />
              </Button>
            </motion.div>
            <DrawerTitle className="text-xl font-extrabold text-foreground">장바구니</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
          {items.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center py-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-[#F9FAFB]">
                <EmptyCartIllustration size={96} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold text-foreground">장바구니가 비어 있어요</p>
                <p className="text-base font-medium text-muted-foreground">맛있는 메뉴를 골라 담아보세요</p>
              </div>
              <Button
                variant="secondary"
                className="mt-2 px-6 font-bold text-base rounded-[14px]"
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
                    <Card className="flex flex-col gap-2.5 p-4 rounded-[20px] shadow-resting border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-card-foreground">
                            {item.nameKo || item.productId}
                          </span>
                          {item.optionsSummary && (
                            <span className="text-base font-medium text-muted-foreground mt-0.5">
                              {item.optionsSummary}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 text-base font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2.5 h-8 rounded-full"
                          aria-label={`${item.nameKo || '상품'} 장바구니에서 삭제`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          삭제
                        </Button>
                      </div>

                      <div className="text-base font-medium text-muted-foreground">
                        단가 {item.unitPrice.toLocaleString("ko-KR")}원
                      </div>

                      <Separator className="my-0.5" />

                      <div className="flex items-center justify-between pt-1">
                        {/* Stepper */}
                        <div className="flex items-center rounded-full border border-border bg-muted/40 p-0.5">
                          <motion.button
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-8 w-8 items-center justify-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:bg-background"
                            aria-label={`${item.nameKo || '상품'} 수량 1개 줄이기`}
                          >
                            <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                          </motion.button>
                          <span
                            className="flex w-7 justify-center font-extrabold text-base text-foreground tabular-nums"
                            aria-live="polite"
                            aria-label={`현재 수량 ${item.quantity}개`}
                          >
                            {item.quantity}
                          </span>
                          <motion.button
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-8 w-8 items-center justify-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full hover:bg-background"
                            aria-label={`${item.nameKo || '상품'} 수량 1개 늘리기`}
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          </motion.button>
                        </div>

                        <RollingPrice
                          value={item.unitPrice * item.quantity}
                          suffix="원"
                          className="font-extrabold text-base text-foreground"
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DrawerFooter className="p-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-border bg-background">
          <Button
            size="cta"
            disabled={items.length === 0}
            className="w-full font-bold text-base rounded-[16px]"
            onClick={onCheckout}
          >
            <RollingPrice
              value={totalPrice}
              suffix="원 주문하기"
              className="font-bold text-base text-primary-foreground"
            />
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
