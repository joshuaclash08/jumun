"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
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
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { formatKRW, getCartItemDisplayName, getCartTotals } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  onCheckout,
}: CartDrawerProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const { speak } = useVoiceGuide();

  const { totalPrice } = getCartTotals(items);

  React.useEffect(() => {
    if (open) {
      if (items.length === 0) {
        speak(t("cart.voiceEmpty"));
      } else {
        speak(
          t("cart.voiceIntro", {
            count: items.length,
            total: formatKRW(totalPrice),
          }),
        );
      }
    }
  }, [open, items.length, totalPrice, speak, t]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="relative grid grid-cols-[44px_1fr_44px] items-center px-4 pt-6 pb-2">
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

        <DrawerBody className="px-4 py-2">
          {items.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center py-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#F9FAFB] dark:bg-card">
                <EmptyCartIllustration size={80} />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-bold text-foreground">
                  {t("cart.emptyTitle")}
                </p>
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
            <div className="flex flex-col gap-3 pb-2">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const displayName = getCartItemDisplayName(item);
                  return (
                    <motion.div
                      key={item.id}
                      layout={!reduceMotion}
                      initial={
                        reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, x: -20, height: 0 }
                      }
                      transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    >
                      <Card className="flex flex-col gap-2.5 p-4 rounded-[20px] shadow-resting border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-card-foreground">
                              {displayName}
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
                              speak(
                                t("cart.voiceDeleted", { name: displayName }),
                              );
                              removeItem(item.id);
                            }}
                            className="shrink-0 text-base font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 px-2.5 h-8 rounded-full"
                            aria-label={t("cart.deleteAria", {
                              name: displayName,
                            })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t("cart.delete")}
                          </Button>
                        </div>

                        <Separator variant="subtle" className="my-0.5" />

                        <div className="flex items-center justify-between pt-1">
                          <QuantityStepper
                            value={item.quantity}
                            onIncrement={() => {
                              speak(
                                t("cart.voiceQuantity", {
                                  name: displayName,
                                  quantity: item.quantity + 1,
                                }),
                              );
                              updateQuantity(item.id, 1);
                            }}
                            onDecrement={() => {
                              speak(
                                t("cart.voiceQuantity", {
                                  name: displayName,
                                  quantity: item.quantity - 1,
                                }),
                              );
                              updateQuantity(item.id, -1);
                            }}
                            min={1}
                            size="sm"
                            itemLabel={displayName}
                          />

                          <RollingPrice
                            value={item.unitPrice * item.quantity}
                            suffix={tCommon("currency")}
                            className="font-extrabold text-base text-foreground"
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter className="px-4 pb-4 pt-2">
            <Button
              size="cta-full"
              disabled={items.length === 0}
              onClick={() => {
                (document.activeElement as HTMLElement)?.blur();
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
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
