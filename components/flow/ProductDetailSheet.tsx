"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Product, CartItemSelection } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import Image from "next/image";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { BackButton } from "@/components/ui/BackButton";
import { QuantityStepper } from "@/components/flow/QuantityStepper";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { generateUUID, cn } from "@/lib/utils";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

export interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductDetailContentProps {
  product: Product;
  onAddToCart: (data: {
    quantity: number;
    selections: CartItemSelection[];
    unitPrice: number;
    optionsSummary: string;
  }) => void;
  onClose: () => void;
}

function ProductDetailContent({
  product,
  onAddToCart,
  onClose,
}: ProductDetailContentProps) {
  const { t } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);
  const { speak } = useVoiceGuide();

  React.useEffect(() => {
    speak(
      t("productDetail.voiceIntro", {
        name: product.nameKo,
        price: formatKRW(product.price),
      }),
    );
  }, [product, speak, t]);

  // Initialize options selections
  const [selections, setSelections] = React.useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    product.optionGroups.forEach((group) => {
      if (group.selectionType === "single" && group.options.length > 0) {
        initial[group.id] = [group.options[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = React.useState(1);

  const handleOptionToggle = (group: Product["optionGroups"][number], optionId: string) => {
    const isSingle = group.selectionType === "single";
    const maxSelections = group.maxSelections;
    const current = selections[group.id] || [];
    const opt = group.options.find((o) => o.id === optionId);

    if (isSingle) {
      setSelections((prev) => ({ ...prev, [group.id]: [optionId] }));
      if (opt) speak(t("productDetail.optionSelectedVoice", { option: opt.labelKo }));
      return;
    }

    if (current.includes(optionId)) {
      setSelections((prev) => ({
        ...prev,
        [group.id]: (prev[group.id] || []).filter((id) => id !== optionId),
      }));
      if (opt) speak(t("productDetail.optionDeselectedVoice", { option: opt.labelKo }));
      return;
    }

    if (maxSelections && current.length >= maxSelections) {
      const msg = t("productDetail.maxSelectionsToast", { count: maxSelections });
      toast({
        kind: "error",
        messageKo: msg,
        variant: "generic",
        hapticsEnabled,
      });
      speak(msg);
      return;
    }

    setSelections((prev) => ({
      ...prev,
      [group.id]: [...(prev[group.id] || []), optionId],
    }));
    if (opt) speak(t("productDetail.optionSelectedVoice", { option: opt.labelKo }));
  };

  const calculateUnitPrice = () => {
    let price = product.price;
    product.optionGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          price += opt.priceDelta;
        }
      });
    });
    return price;
  };

  const getOptionsSummary = () => {
    const labels: string[] = [];
    product.optionGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          labels.push(opt.labelKo);
        }
      });
    });
    return labels.join(" / ");
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = unitPrice * quantity;

  const buildItemData = () => {
    const itemSelections: CartItemSelection[] = [];
    product.optionGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      if (selectedIds.length > 0) {
        itemSelections.push({
          groupId: group.id,
          optionIds: selectedIds,
        });
      }
    });

    return {
      quantity,
      selections: itemSelections,
      unitPrice,
      optionsSummary: getOptionsSummary(),
    };
  };

  const handleAddToCart = () => {
    onAddToCart(buildItemData());
  };

  return (
    <div className="relative flex flex-col max-h-[92vh] min-h-0 overflow-hidden bg-background">
      {/* Screen-reader accessible title for Radix/Vaul dialog requirements */}
      <DrawerTitle className="sr-only">{product.nameKo}</DrawerTitle>

      {/* Top Header Bar: Back Button + Menu Title + Spacer */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-0.5 border-b border-border/40 bg-background/95 backdrop-blur-md shrink-0">
        <BackButton
          onClick={onClose}
          label={t("productDetail.closeAria")}
        />
        <span className="text-base font-extrabold text-foreground truncate max-w-[220px]">
          {product.nameKo}
        </span>
        <div className="w-11" aria-hidden="true" />
      </div>

      {/* Scrollable Content Container */}
      <div
        data-lenis-prevent=""
        tabIndex={-1}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-3.5 pb-32 scrollbar-none outline-none"
      >
        <div className="flex flex-col gap-6">
          {/* Rounded Hero Visual Stage */}
          <div className="flex flex-col gap-4">
            <div
              style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
              className="relative flex h-60 sm:h-72 w-full items-center justify-center rounded-[22px] overflow-hidden shrink-0"
              aria-hidden="true"
            >
              <Image
                src={product.imageUrl}
                alt={product.nameKo}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 560px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-1.5 px-0.5">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {product.nameKo}
              </h2>
              <DrawerDescription className="text-base font-medium text-muted-foreground leading-relaxed mt-0.5">
                {product.descriptionKo}
              </DrawerDescription>

              {/* Price & Tactile Stepper Row */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground">{t("productDetail.orderPrice")}</span>
                  <span className="text-xl font-black text-foreground tabular-nums tracking-[0.5px]">
                    {formatKRW(unitPrice)}
                  </span>
                </div>

                {/* Tactile Stepper */}
                <QuantityStepper
                  value={quantity}
                  onIncrement={() => {
                    const next = Math.min(20, quantity + 1);
                    setQuantity(next);
                    speak(t("productDetail.quantityVoice", { count: next }));
                  }}
                  onDecrement={() => {
                    const next = Math.max(1, quantity - 1);
                    setQuantity(next);
                    speak(t("productDetail.quantityVoice", { count: next }));
                  }}
                  min={1}
                  max={20}
                  itemLabel={t("productDetail.quantityLabel")}
                />
              </div>
            </div>
          </div>

          {/* DoorDash / Baemin Style Option Groups: Clean Slim Inline Rows */}
          {product.optionGroups && product.optionGroups.length > 0 && (
            <div className="flex flex-col gap-6 pt-2">
              {product.optionGroups.map((group) => {
                const selectedIds = selections[group.id] || [];
                const isSingle = group.selectionType === "single";

                return (
                  <div key={group.id} className="flex flex-col gap-2.5">
                    {/* Visual Header: Title + Required Badge */}
                    <div className="flex items-center gap-2 px-0.5" aria-hidden="true">
                      <h3 className="text-base font-extrabold text-foreground">
                        {group.labelKo}
                      </h3>
                      {group.required && (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-extrabold text-secondary-foreground">
                          {t("productDetail.requiredBadge")}
                        </span>
                      )}
                    </div>
                    {/* VoiceOver announcement */}
                    <span className="sr-only">
                      {`${group.labelKo}, ${group.required ? t("productDetail.requiredAria") : t("productDetail.optionalAria")}`}
                    </span>

                    {/* Slim Inline Option List with Hairline Dividers */}
                    <div className="flex flex-col divide-y divide-border/40">
                      {group.options.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);
                        const priceDescription =
                          opt.priceDelta > 0
                            ? t("productDetail.extraPriceAria", { price: formatKRW(opt.priceDelta) })
                            : "";

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => handleOptionToggle(group, opt.id)}
                            aria-pressed={isSelected}
                            aria-label={`${opt.labelKo}${priceDescription}`}
                            className={cn(
                              "flex items-center justify-between py-3.5 px-3.5 text-left transition-colors cursor-pointer min-h-[50px] rounded-[12px]",
                              isSelected ? "bg-primary/[0.06]" : "hover:bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Radio (round) or Checkbox (rounded-md) Indicator */}
                              <div
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center border transition-all",
                                  isSingle ? "rounded-full" : "rounded-md",
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                                    : "border-muted-foreground/35 bg-background"
                                )}
                                aria-hidden="true"
                              >
                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <span
                                className={cn(
                                  "text-base transition-colors",
                                  isSelected
                                    ? "font-extrabold text-foreground"
                                    : "font-semibold text-foreground/90"
                                )}
                              >
                                {opt.labelKo}
                              </span>
                            </div>

                            {opt.priceDelta > 0 ? (
                              <span className="text-base font-bold tabular-nums text-foreground/80 tracking-tight">
                                +{formatKRW(opt.priceDelta)}
                              </span>
                            ) : null}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed Bottom Action Bar: Single Unified Cart CTA ── */}
      <StickyActionBar position="absolute">
        <Button
          type="button"
          variant="default"
          size="cta-full"
          onClick={handleAddToCart}
          className="w-full bg-primary text-primary-foreground font-extrabold hover:bg-primary/95 rounded-[14px] shadow-sm py-4 h-auto min-h-[52px]"
        >
          <RollingPrice
            value={totalPrice}
            suffix={t("productDetail.addToCartSuffix")}
            className="font-extrabold text-base text-primary-foreground"
          />
        </Button>
      </StickyActionBar>
    </div>
  );
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const { t } = useTranslation("menu");
  const addItem = useCartStore((state) => state.addItem);
  const { speak } = useVoiceGuide();

  if (!product) return null;

  const handleAdd = (data: {
    quantity: number;
    selections: CartItemSelection[];
    unitPrice: number;
    optionsSummary: string;
  }) => {
    addItem({
      id: generateUUID(),
      productId: product.id,
      nameKo: product.nameKo,
      optionsSummary: data.optionsSummary,
      quantity: data.quantity,
      selections: data.selections,
      unitPrice: data.unitPrice,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] h-auto rounded-t-[28px] overflow-hidden p-0 border-t border-border/60">
        <ProductDetailContent
          key={product.id}
          product={product}
          onClose={() => onOpenChange(false)}
          onAddToCart={(data) => {
            speak(t("productDetail.voiceAdded", { name: product.nameKo, quantity: data.quantity }));
            handleAdd(data);
            onOpenChange(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
