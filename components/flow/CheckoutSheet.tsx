"use client";

import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Smartphone, TriangleAlert, Utensils, ShoppingBag } from "lucide-react";
import { OrderService } from "@/lib/services";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { SelectionCard } from "./SelectionCard";
import { BackButton } from "@/components/ui/BackButton";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { formatKRW, getCartItemDisplayName, getCartTotals } from "@/lib/format";
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
  const [userPaymentMethod, setUserPaymentMethod] = React.useState<string | null>(null);
  const paymentMethod = userPaymentMethod ?? defaultPaymentMethod;
  const setPaymentMethod = (method: string) => setUserPaymentMethod(method);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { speak } = useVoiceGuide();

  const { totalPrice } = getCartTotals(items);

  React.useEffect(() => {
    if (open) {
      speak(t("checkout.voiceIntro", { total: formatKRW(totalPrice) }));
    }
  }, [open, totalPrice, speak, t]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);
      setUserPaymentMethod(null);
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
      ;(document.activeElement as HTMLElement)?.blur();
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
        <DrawerHeader className="relative grid grid-cols-[44px_1fr_44px] items-center px-4 pt-6 pb-2">
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

        <DrawerBody className="px-4 py-3">
          <div className="flex flex-col gap-6 pb-2">
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

            {/* 1. Dining Place */}
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
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground">
                    {storeInfo?.orderType === "dine-in"
                      ? t("checkout.dineIn")
                      : t("checkout.takeout")}
                  </span>
                  {storeInfo?.orderType === "dine-in" && (
                    <span className="text-base font-medium text-muted-foreground">
                      {tCommon("tableNumber", { table: storeInfo.table })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Order Summary */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-base font-bold text-foreground">
                {t("checkout.orderSummary", { count: items.length })}
              </h3>
              <Card className="flex flex-col gap-3 p-4 rounded-[20px] shadow-resting border-border">
                {items.map((item, index) => {
                  const displayName = getCartItemDisplayName(item);
                  return (
                    <React.Fragment key={item.id}>
                      {index > 0 && <Separator />}
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
                          <span className="text-base font-medium text-muted-foreground mt-0.5">
                            {t("cart.voiceQuantity", { name: displayName, quantity: item.quantity })}
                          </span>
                        </div>
                        <RollingPrice
                          value={item.unitPrice * item.quantity}
                          suffix={tCommon("currency")}
                          className="font-extrabold text-base text-foreground shrink-0"
                        />
                      </div>
                    </React.Fragment>
                  );
                })}

                <Separator variant="hairline" className="my-1" />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-foreground">
                    {t("checkout.totalAmount")}
                  </span>
                  <RollingPrice
                    value={totalPrice}
                    suffix={tCommon("currency")}
                    className="text-lg font-extrabold text-primary"
                  />
                </div>
              </Card>
            </div>

            {/* 3. Payment Method */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">{t("checkout.paymentMethod")}</h3>
                <Badge variant="outline" className="text-base font-semibold border-border">
                  {t("productDetail.requiredBadge")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("checkout.paymentMethod")}>
                <SelectionCard
                  isSelected={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  label={tSettings("payment.methods.card")}
                  icon={<CreditCard className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                  role="radio"
                />
                <SelectionCard
                  isSelected={paymentMethod === "easy-pay"}
                  onClick={() => setPaymentMethod("easy-pay")}
                  label={tSettings("payment.methods.easyPay")}
                  icon={<Smartphone className="h-5 w-5" />}
                  reduceMotion={reduceMotion}
                  role="radio"
                />
              </div>
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter className="px-4 pb-4 pt-2">
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
