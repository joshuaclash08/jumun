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
import { useTranslation } from "@/lib/i18n";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
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
        speak(t("cart.voiceEmpty"));
      } else {
        speak(t("cart.voiceIntro", { count: items.length, total: formatKRW(totalPrice) }));
      }
    }
  }, [open, items.length, totalPrice, speak, t]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="relative flex flex-col max-h-[90vh] min-h-0 overflow-hidden">
          <DrawerHeader className="relative grid grid-cols-[44px_1fr_44px] items-center px-4 pt-7 pb-3">
            <BackButton
              onClick={() => onOpenChange(false)}
              label={t("cart.closeAria")}
              className="-ml-1"
            />
            <DrawerTitle className="text-lg sm:text-xl font-extrabold text-foreground text-center">
              {t("cart.title")}
            </DrawerTitle>
            <div className="w-11" aria-hidden="true" />
          </DrawerHeader>

          <div
            data-lenis-prevent=""
            tabIndex={-1}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-28 scrollbar-none outline-none"
          >
            {items.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center py-6">
                <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-[#F9FAFB]">
                  <EmptyCartIllustration size={96} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-bold text-foreground">{t("cart.emptyTitle")}</p>
                  <p className="text-base font-medium text-muted-foreground">{t("cart.emptyDesc")}</p>
                </div>
                <Button
                  variant="secondary"
                  className="mt-2 px-6 font-bold text-base rounded-[14px]"
                  onClick={() => onOpenChange(false)}
                >
                  {t("cart.browseMenu")}
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
                              speak(t("cart.voiceDeleted", { name: item.nameKo || item.productId }));
                              removeItem(item.id);
                            }}
                            className="shrink-0 text-base font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2.5 h-8 rounded-full"
                            aria-label={t("cart.deleteAria", { name: item.nameKo || item.productId })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("cart.delete")}
                          </Button>
                        </div>

                        <div className="text-base font-medium text-muted-foreground">
                          {t("cart.unitPrice", { price: formatKRW(item.unitPrice) })}
                        </div>

                        <Separator className="my-0.5" />

                        <div className="flex items-center justify-between pt-1">
                          <QuantityStepper
                            value={item.quantity}
                            onIncrement={() => {
                              speak(t("cart.voiceQuantity", { name: item.nameKo || item.productId, quantity: item.quantity + 1 }));
                              updateQuantity(item.id, 1);
                            }}
                            onDecrement={() => {
                              speak(t("cart.voiceQuantity", { name: item.nameKo || item.productId, quantity: item.quantity - 1 }));
                              updateQuantity(item.id, -1);
                            }}
                            min={1}
                            size="sm"
                            itemLabel={item.nameKo || item.productId}
                          />

                          <RollingPrice
                            value={item.unitPrice * item.quantity}
                            suffix={tCommon("currency")}
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
                  speak(t("cart.voiceProceed"));
                  onCheckout();
                }}
              >
                <RollingPrice
                  value={totalPrice}
                  suffix={t("cart.orderButtonSuffix")}
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
