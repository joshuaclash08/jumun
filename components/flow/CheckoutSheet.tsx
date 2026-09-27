"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Smartphone, TriangleAlert, Utensils, ShoppingBag } from "lucide-react";
import { OrderService } from "@/lib/services";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { SelectionCard } from "./SelectionCard";
import { BackButton } from "@/components/ui/BackButton";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CheckoutSheet({ open, onOpenChange, onConfirm }: CheckoutSheetProps) {
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  const { t: tSettings } = useTranslation("settings");
  const { items, storeInfo, setOrderStatus, setLastReceipt, clearCart } = useCartStore();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const defaultPaymentMethod = usePaymentStore((state) => state.defaultMethod);
  const [paymentMethod, setPaymentMethod] = React.useState<string>(defaultPaymentMethod);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { speak } = useVoiceGuide();

  const totalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  React.useEffect(() => {
    if (open) {
      speak(t("checkout.voiceIntro", { total: formatKRW(totalPrice) }));
    }
  }, [open, totalPrice, speak, t]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
    }
    onOpenChange(newOpen);
  };

  const handleCheckout = async () => {
    if (!storeInfo) {
      const msg = t("checkout.missingStoreInfo");
      setErrorMessage(msg);
      speak(msg);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setOrderStatus("submitting");

    try {
      const receipt = await OrderService.submitOrder(storeInfo, items);
      setLastReceipt(receipt);
      setOrderStatus("confirmed");
      clearCart();
      speak(t("checkout.voiceSuccess"));
      onOpenChange(false);
      onConfirm();
    } catch (err: unknown) {
      setOrderStatus("failed");
      const message = err instanceof Error ? err.message : t("checkout.failedPayment");
      setErrorMessage(message);
      speak(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="relative flex flex-col max-h-[90vh] min-h-0 overflow-hidden">
          <DrawerHeader className="relative grid grid-cols-[44px_1fr_44px] items-center px-4 pt-7 pb-3">
            <BackButton
              onClick={() => handleOpenChange(false)}
              label={t("checkout.closeAria")}
              className="-ml-1"
            />
            <DrawerTitle className="text-lg sm:text-xl font-extrabold text-foreground text-center">
              {t("checkout.title")}
            </DrawerTitle>
            <div className="w-11" aria-hidden="true" />
          </DrawerHeader>

          <div
            data-lenis-prevent=""
            tabIndex={-1}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-28 scrollbar-none outline-none"
          >
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
                    {t("checkout.errorNotice")}
                  </p>
                </div>
              )}

              {/* 1. Dining Place — decided at entry (OrderTypeSelectView), read-only here */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-base font-bold text-foreground">{t("checkout.diningPlace")}</h3>
                <div className="flex items-center gap-3 rounded-[18px] border-2 border-border bg-card p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {storeInfo?.orderType === "dine-in" ? (
                      <Utensils className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-base font-bold text-foreground">
                      {storeInfo?.orderType === "dine-in" ? t("checkout.dineIn") : t("checkout.takeout")}
                    </span>
                    <span className="text-base font-medium text-muted-foreground">
                      {storeInfo?.orderType === "dine-in" ? tCommon("tableNumber", { table: storeInfo.table }) : t("checkout.pickupCounter")}
                    </span>
                  </span>
                </div>
              </div>

              {/* 2. Order Summary */}
              <Card className="flex flex-col gap-3 p-4.5 rounded-[22px] shadow-resting border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    {t("checkout.orderSummary", { count: items.reduce((s, i) => s + i.quantity, 0) })}
                  </h3>
                  <Badge variant="secondary" className="text-base font-bold px-2.5 py-0.5">
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
                      <span className="font-extrabold text-foreground tabular-nums tracking-[0.6px]">
                        {formatKRW(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-1 text-base font-bold">
                  <span className="text-foreground">{t("checkout.totalAmount")}</span>
                  <RollingPrice
                    value={totalPrice}
                    suffix={tCommon("currency")}
                    className="text-primary text-xl font-black"
                  />
                </div>
              </Card>

              {/* 3. Payment Method */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-base font-bold text-foreground">{t("checkout.paymentMethod")}</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <SelectionCard
                    isSelected={paymentMethod === "card"}
                    onClick={() => {
                      setPaymentMethod("card");
                      speak(t("checkout.cardSelectedVoice"));
                    }}
                    label={tSettings("payment.methods.card")}
                    icon={<CreditCard className="h-5 w-5" />}
                    reduceMotion={reduceMotion}
                  />
                  <SelectionCard
                    isSelected={paymentMethod === "easy-pay"}
                    onClick={() => {
                      setPaymentMethod("easy-pay");
                      speak(t("checkout.easyPaySelectedVoice"));
                    }}
                    label={tSettings("payment.methods.easyPay")}
                    icon={<Smartphone className="h-5 w-5" />}
                    reduceMotion={reduceMotion}
                  />
                </div>
              </div>
            </div>
          </div>

          <StickyActionBar position="absolute">
            <Button
              size="cta-full"
              disabled={isSubmitting || items.length === 0}
              onClick={handleCheckout}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  {t("checkout.processing")}
                </>
              ) : errorMessage ? (
                <RollingPrice
                  value={totalPrice}
                  suffix={t("checkout.retrySuffix")}
                  className="font-extrabold text-base text-primary-foreground"
                />
              ) : (
                <RollingPrice
                  value={totalPrice}
                  suffix={t("checkout.paySuffix")}
                  className="font-extrabold text-base text-primary-foreground"
                />
              )}
            </Button>
          </StickyActionBar>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
