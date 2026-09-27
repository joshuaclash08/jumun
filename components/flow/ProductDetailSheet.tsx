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
  onHandleVariantChange?: (variant: "auto" | "light" | "dark") => void;
}

const DARK_TOP_PRODUCT_IDS = new Set([
  "chocolate-brownie",
  "butter-croissant",
  "salt-bread",
]);

export function getProductHandleVariant(product?: Product | null): "light" | "dark" {
  if (!product) return "dark";
  if (DARK_TOP_PRODUCT_IDS.has(product.id)) return "light";
  if (product.themeBg) {
    const hex = product.themeBg.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum <= 140 ? "light" : "dark";
  }
  return "dark";
}

function ProductDetailContent({
  product,
  onAddToCart,
  onClose,
  onHandleVariantChange,
}: ProductDetailContentProps) {
  const { t } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);
  const { speak } = useVoiceGuide();

  // Dynamic Luminance & Scroll Detection
  const defaultPhotoDark = product ? DARK_TOP_PRODUCT_IDS.has(product.id) : false;
  const [isScrolledPastHero, setIsScrolledPastHero] = React.useState(false);
  const [photoLuminanceDark, setPhotoLuminanceDark] = React.useState<boolean>(defaultPhotoDark);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    try {
      const img = e.currentTarget;
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 4;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight * 0.15, 0, 0, 16, 4);
      const data = ctx.getImageData(0, 0, 16, 4).data;
      let totalLum = 0;
      const count = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const avgLum = totalLum / count;
      const isDark = avgLum <= 140;
      setPhotoLuminanceDark(isDark);
      if (!isScrolledPastHero && onHandleVariantChange) {
        onHandleVariantChange(isDark ? "light" : "dark");
      }
    } catch {
      // Ignore canvas errors and maintain current variant
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const pastHero = e.currentTarget.scrollTop > 180;
    if (pastHero !== isScrolledPastHero) {
      setIsScrolledPastHero(pastHero);
      if (onHandleVariantChange) {
        onHandleVariantChange(pastHero ? "auto" : (photoLuminanceDark ? "light" : "dark"));
      }
    }
  };

  React.useEffect(() => {
    speak(
      t("productDetail.voiceIntro", {
        name: product.nameKo,
        price: formatKRW(product.price),
      }),
    );
  }, [product, speak, t]);

  // Initialize options selections
  const [selections, setSelections] = React.useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {};
      product.optionGroups.forEach((group) => {
        if (group.selectionType === "single" && group.options.length > 0) {
          initial[group.id] = [group.options[0].id];
        } else {
          initial[group.id] = [];
        }
      });
      return initial;
    },
  );

  const [quantity, setQuantity] = React.useState(1);

  const handleOptionToggle = (
    group: Product["optionGroups"][number],
    optionId: string,
  ) => {
    const isSingle = group.selectionType === "single";
    const maxSelections = group.maxSelections;
    const current = selections[group.id] || [];
    const opt = group.options.find((o) => o.id === optionId);

    if (isSingle) {
      setSelections((prev) => ({ ...prev, [group.id]: [optionId] }));
      if (opt)
        speak(t("productDetail.optionSelectedVoice", { option: opt.labelKo }));
      return;
    }

    if (current.includes(optionId)) {
      setSelections((prev) => ({
        ...prev,
        [group.id]: (prev[group.id] || []).filter((id) => id !== optionId),
      }));
      if (opt)
        speak(
          t("productDetail.optionDeselectedVoice", { option: opt.labelKo }),
        );
      return;
    }

    if (maxSelections && current.length >= maxSelections) {
      const msg = t("productDetail.maxSelectionsToast", {
        count: maxSelections,
      });
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
    if (opt)
      speak(t("productDetail.optionSelectedVoice", { option: opt.labelKo }));
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
    <div className="relative flex flex-col max-h-[96vh] h-[96vh] min-h-0 overflow-hidden bg-background">
      {/* Screen-reader accessible title for Radix/Vaul dialog requirements */}
      <DrawerTitle className="sr-only">{product.nameKo}</DrawerTitle>

      {/* Floating Glass Back Button overlaid on top-left of hero photo */}
      <div className="absolute top-3.5 left-4 z-30 pointer-events-auto">
        <BackButton
          onClick={onClose}
          label={t("productDetail.closeAria")}
          className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 hover:text-white border-none shadow-sm flex items-center justify-center transition-all"
        />
      </div>

      {/* Scrollable Content Container starting right at top-0 */}
      <div
        data-lenis-prevent=""
        tabIndex={-1}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-32 scrollbar-none outline-none"
      >
        <div className="flex flex-col">
          {/* Top Hero Visual Stage with Gentle Bottom Blur/Gradient Fusion touching top-0 */}
          <div
            style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
            className="relative h-72 sm:h-80 md:h-[350px] w-full overflow-hidden shrink-0"
            aria-hidden="true"
          >
            <Image
              src={product.imageUrl}
              alt={product.nameKo}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover object-center"
              onLoad={handleImageLoad}
            />
            {/* Subtle Blur & Gentle Gradient Fusion at bottom of photo — reduced intensity so photo bottom stays fully visible */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/80 via-background/25 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 backdrop-blur-[1px] bg-gradient-to-t from-background/20 to-transparent" />
          </div>

          {/* Structured Content Container bounded by maximum frame & comfortable margins */}
          <div className="w-full max-w-[560px] sm:max-w-[600px] mx-auto px-5 sm:px-6 flex flex-col gap-6 pt-3 pb-8">
            {/* Title, Description & Price/Stepper Row */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight">
                {product.nameKo}
              </h2>
              <DrawerDescription className="text-base font-medium text-muted-foreground leading-relaxed mt-0.5">
                {product.descriptionKo}
              </DrawerDescription>

              {/* Price & Tactile Stepper Row */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-2">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("productDetail.orderPrice")}
                  </span>
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

            {/* DoorDash / Baemin Style Option Groups: Clean Slim Inline Rows */}
            {product.optionGroups && product.optionGroups.length > 0 && (
              <div className="flex flex-col gap-6 pt-1">
              {product.optionGroups.map((group) => {
                const selectedIds = selections[group.id] || [];
                const isSingle = group.selectionType === "single";

                return (
                  <div key={group.id} className="flex flex-col gap-2.5">
                    {/* Visual Header: Title + Required Badge */}
                    <div
                      className="flex items-center gap-2 px-0.5"
                      aria-hidden="true"
                    >
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
                            ? t("productDetail.extraPriceAria", {
                                price: formatKRW(opt.priceDelta),
                              })
                            : "";

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileTap={
                              reduceMotion ? undefined : { scale: 0.99 }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                            onClick={() => handleOptionToggle(group, opt.id)}
                            aria-pressed={isSelected}
                            aria-label={`${opt.labelKo}${priceDescription}`}
                            className={cn(
                              "flex items-center justify-between py-3.5 px-3.5 text-left transition-colors cursor-pointer min-h-[50px] rounded-[12px]",
                              isSelected
                                ? "bg-primary/[0.06]"
                                : "hover:bg-muted/30",
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
                                    : "border-muted-foreground/35 bg-background",
                                )}
                                aria-hidden="true"
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-base transition-colors",
                                  isSelected
                                    ? "font-extrabold text-foreground"
                                    : "font-semibold text-foreground/90",
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

  // Initial variant based on product hero luminance (accurate per-product + fallback)
  const initialVariant = React.useMemo(() => getProductHandleVariant(product), [product]);

  const [dynamicVariant, setDynamicVariant] = React.useState<"auto" | "light" | "dark" | null>(null);
  const [prevProductId, setPrevProductId] = React.useState(product?.id);

  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setDynamicVariant(null);
  }

  const handleVariant = dynamicVariant ?? initialVariant;

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
      <DrawerContent
        handleVariant={handleVariant}
        className="max-h-[96vh] h-[96vh] rounded-t-[28px] overflow-hidden p-0 border-t-0"
      >
        <ProductDetailContent
          key={product.id}
          product={product}
          onClose={() => onOpenChange(false)}
          onHandleVariantChange={setDynamicVariant}
          onAddToCart={(data) => {
            speak(
              t("productDetail.voiceAdded", {
                name: product.nameKo,
                quantity: data.quantity,
              }),
            );
            handleAdd(data);
            onOpenChange(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
