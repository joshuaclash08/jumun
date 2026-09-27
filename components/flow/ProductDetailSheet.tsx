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
import { generateUUID } from "@/lib/utils";
import { formatKRW } from "@/lib/format";

interface ProductDetailSheetProps {
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
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const hapticsEnabled = useAccessibilityStore((state) => state.hapticsEnabled);
  const { speak } = useVoiceGuide();

  React.useEffect(() => {
    speak(`${product.nameKo}, 기본 가격 ${formatKRW(product.price)}. 옵션과 수량을 선택해 주세요.`);
  }, [product, speak]);

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
      if (opt) speak(`${opt.labelKo} 선택`);
      return;
    }

    if (current.includes(optionId)) {
      setSelections((prev) => ({
        ...prev,
        [group.id]: (prev[group.id] || []).filter((id) => id !== optionId),
      }));
      if (opt) speak(`${opt.labelKo} 선택 해제`);
      return;
    }

    if (maxSelections && current.length >= maxSelections) {
      const msg = `최대 ${maxSelections}개까지 선택할 수 있어요.`;
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
    if (opt) speak(`${opt.labelKo} 선택`);
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

  const handleSubmit = () => {
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

    onAddToCart({
      quantity,
      selections: itemSelections,
      unitPrice,
      optionsSummary: getOptionsSummary(),
    });
  };

  return (
    <div className="relative flex flex-col max-h-[90vh] min-h-0 overflow-hidden">
      {/* Screen-reader accessible title for Radix/Vaul dialog requirements */}
      <DrawerTitle className="sr-only">{product.nameKo}</DrawerTitle>

      {/* Top Floating Back Button overlaid on hero stage */}
      <div className="absolute top-3 left-3 z-30">
        <BackButton
          onClick={onClose}
          label="메뉴 상세 닫기"
          className="bg-background/80 backdrop-blur-md"
        />
      </div>

      {/* Scrollable Content Container */}
      <div
        data-lenis-prevent=""
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-2.5 pb-28 scrollbar-none"
      >
        <div className="flex flex-col gap-6">
          {/* Large Hero Visual Stage */}
          <div className="flex flex-col gap-4">
            <div
              style={{ backgroundColor: product.themeBg || '#F4F4F6' }}
              className="relative flex h-56 sm:h-64 w-full items-center justify-center rounded-[24px] overflow-hidden border border-black/5 shadow-resting"
              aria-hidden="true"
            >
              <Image
                src={product.imageUrl}
                alt={product.nameKo}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-1.5 px-0.5">
              <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                {product.nameKo}
              </h2>
              <DrawerDescription className="text-base font-medium text-muted-foreground leading-relaxed">
                {product.descriptionKo}
              </DrawerDescription>

              {/* Price & Stepper Row */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-2">
                <div className="flex flex-col">
                  <span className="text-base text-muted-foreground font-semibold">주문 금액</span>
                  <span className="text-xl font-black text-foreground tabular-nums tracking-[0.6px]">
                    {formatKRW(unitPrice)}
                  </span>
                </div>

                {/* Tactile Stepper */}
                <QuantityStepper
                  value={quantity}
                  onIncrement={() => {
                    const next = Math.min(20, quantity + 1);
                    setQuantity(next);
                    speak(`수량 ${next}개`);
                  }}
                  onDecrement={() => {
                    const next = Math.max(1, quantity - 1);
                    setQuantity(next);
                    speak(`수량 ${next}개`);
                  }}
                  min={1}
                  max={20}
                  itemLabel="주문"
                />
              </div>
            </div>
          </div>

          {/* Option Groups */}
          {product.optionGroups && product.optionGroups.length > 0 && (
            <div className="flex flex-col gap-6 pt-2">
              {product.optionGroups.map((group) => {
                const selectedIds = selections[group.id] || [];

                return (
                  <div key={group.id} className="flex flex-col gap-3">
                    {/* Visual Header: Title + Required Badge directly beside it */}
                    <div className="flex items-center gap-2 px-0.5" aria-hidden="true">
                      <h3 className="text-base font-extrabold text-foreground">
                        {group.labelKo}
                      </h3>
                      {group.required && (
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-sm font-extrabold text-secondary-foreground">
                          필수
                        </span>
                      )}
                    </div>
                    {/* VoiceOver announcement */}
                    <span className="sr-only">
                      {`${group.labelKo}, ${group.required ? "필수 선택" : "선택 사항"}`}
                    </span>

                    <div className="flex flex-col gap-2">
                      {group.options.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);
                        const priceDescription = opt.priceDelta > 0 ? `, 추가 금액 ${formatKRW(opt.priceDelta)}` : "";

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => handleOptionToggle(group, opt.id)}
                            aria-pressed={isSelected}
                            aria-label={`${opt.labelKo}${priceDescription}`}
                            className={`flex min-h-[56px] items-center justify-between rounded-[18px] border-2 p-3.5 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 font-bold text-primary shadow-2xs"
                                : "border-border bg-card text-foreground hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex w-full items-center justify-between pointer-events-none" aria-hidden="true">
                              <div className="flex items-center gap-3">
                                {/* Radio / Checkbox Indicator */}
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                    isSelected
                                      ? "border-primary bg-primary text-white"
                                      : "border-border bg-background"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span className="text-base font-medium">{opt.labelKo}</span>
                              </div>

                              {opt.priceDelta > 0 ? (
                                <span className="text-base font-extrabold tabular-nums tracking-[0.6px]">
                                  +{formatKRW(opt.priceDelta)}
                                </span>
                              ) : null}
                            </div>
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

      {/* ── Fixed Bottom Action Bar with Progressive Blur Fade (matching Settings) ── */}
      <StickyActionBar position="absolute">
        <Button size="cta-full" onClick={handleSubmit}>
          <RollingPrice
            value={totalPrice}
            suffix="원 담기"
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
  const addItem = useCartStore((state) => state.addItem);
  const { speak } = useVoiceGuide();

  if (!product) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <ProductDetailContent
          key={product.id}
          product={product}
          onClose={() => onOpenChange(false)}
          onAddToCart={(data) => {
            speak(`${product.nameKo} ${data.quantity}개를 장바구니에 담았습니다.`);
            addItem({
              id: generateUUID(),
              productId: product.id,
              nameKo: product.nameKo,
              optionsSummary: data.optionsSummary,
              quantity: data.quantity,
              selections: data.selections,
              unitPrice: data.unitPrice,
            });
            onOpenChange(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
}
