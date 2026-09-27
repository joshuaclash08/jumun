"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { EmptyCartIllustration } from "@/components/ui/TossIllustrations";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { BackButton } from "@/components/ui/BackButton";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { formatKRW } from "@/lib/format";

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
  const { speak } = useVoiceGuide();

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  React.useEffect(() => {
    if (open) {
      if (items.length === 0) {
        speak("장바구니가 비어 있습니다.");
      } else {
        speak(`장바구니입니다. 총 ${items.length}개 메뉴, 합계 ${formatKRW(totalPrice)}입니다.`);
      }
    }
  }, [open, items.length, totalPrice, speak]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="relative flex flex-col max-h-[90vh] min-h-0 overflow-hidden">
          <DrawerHeader className="relative grid grid-cols-[44px_1fr_44px] items-center px-4 py-3">
            <BackButton
              onClick={() => onOpenChange(false)}
              label="장바구니 닫기"
              className="-ml-1"
            />
            <DrawerTitle className="text-lg sm:text-xl font-extrabold text-foreground text-center">장바구니</DrawerTitle>
            <div className="w-11" aria-hidden="true" />
          </DrawerHeader>

          <div
            data-lenis-prevent=""
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-28 scrollbar-none"
          >
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
                            onClick={() => {
                              speak(`${item.nameKo || '상품'} 메뉴를 삭제했습니다.`);
                              removeItem(item.id);
                            }}
                            className="shrink-0 text-base font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2.5 h-8 rounded-full"
                            aria-label={`${item.nameKo || '상품'} 장바구니에서 삭제`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제
                          </Button>
                        </div>

                        <div className="text-base font-medium text-muted-foreground">
                          단가 {formatKRW(item.unitPrice)}
                        </div>

                        <Separator className="my-0.5" />

                        <div className="flex items-center justify-between pt-1">
                          <QuantityStepper
                            value={item.quantity}
                            onIncrement={() => {
                              speak(`${item.nameKo || '상품'} 수량 ${item.quantity + 1}개`);
                              updateQuantity(item.id, 1);
                            }}
                            onDecrement={() => {
                              speak(`${item.nameKo || '상품'} 수량 ${item.quantity - 1}개`);
                              updateQuantity(item.id, -1);
                            }}
                            min={1}
                            size="sm"
                            itemLabel={item.nameKo || "상품"}
                          />

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

          {items.length > 0 && (
            <StickyActionBar position="absolute">
              <Button
                size="cta-full"
                disabled={items.length === 0}
                onClick={() => {
                  speak("주문 및 결제 화면으로 이동합니다.");
                  onCheckout();
                }}
              >
                <RollingPrice
                  value={totalPrice}
                  suffix="원 주문하기"
                  className="font-extrabold text-base text-primary-foreground"
                />
              </Button>
            </StickyActionBar>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
