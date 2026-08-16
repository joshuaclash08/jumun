"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Minus, ChevronLeft } from "lucide-react";
import type { Product, CartItemSelection } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { ProductIllustration } from "@/components/ui/TossIllustrations";
import { RollingPrice } from "@/components/ui/RollingPrice";
import { generateUUID } from "@/lib/utils";

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

  const handleOptionToggle = (groupId: string, optionId: string, isSingle: boolean) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (isSingle) {
        return { ...prev, [groupId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...current, optionId] };
        }
      }
    });
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
    <>
      {/* Top Header with Consistent Top-Left Back Button */}
      <DrawerHeader className="relative border-b border-border/40 px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          <motion.div
            whileTap={reduceMotion ? undefined : { scale: 0.90 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="메뉴 상세 닫기"
              className="h-12 w-12 rounded-full text-foreground hover:bg-muted -ml-1.5"
            >
              <ChevronLeft className="h-7 w-7 stroke-[2.8]" aria-hidden="true" />
            </Button>
          </motion.div>
          <DrawerTitle className="text-xl font-extrabold text-foreground truncate">
            {product.nameKo}
          </DrawerTitle>
        </div>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <div className="flex flex-col gap-6">
          {/* Large Hero Visual Stage matching Image 1 Reference */}
          <div className="flex flex-col gap-4">
            <div
              className="relative flex h-52 sm:h-60 w-full items-center justify-center rounded-[24px] overflow-hidden"
              aria-hidden="true"
            >
              <ProductIllustration icon={product.icon} size={110} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background via-background/40 to-transparent" />
            </div>

            <div className="flex flex-col gap-1.5 px-0.5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                  {product.nameKo}
                </h2>
              </div>
              <DrawerDescription className="text-base font-medium text-muted-foreground leading-relaxed">
                {product.descriptionKo}
              </DrawerDescription>

              {/* Price & Stepper Row */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-2">
                <div className="flex flex-col">
                  <span className="text-base text-muted-foreground font-semibold">주문 금액</span>
                  <span className="text-xl font-black text-foreground tabular-nums">
                    {unitPrice.toLocaleString("ko-KR")}원
                  </span>
                </div>

                {/* Tactile Stepper */}
                <div className="flex items-center rounded-full border border-border bg-muted/40 p-1">
                  <motion.button
                    type="button"
                    whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-background disabled:opacity-30 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    aria-label="주문 수량 1개 줄이기"
                  >
                    <Minus className="h-4 w-4 stroke-[2.5]" />
                  </motion.button>
                  <span
                    className="flex w-9 justify-center text-base font-extrabold text-foreground tabular-nums"
                    aria-live="polite"
                    aria-label={`현재 주문 수량 ${quantity}개`}
                  >
                    {quantity}
                  </span>
                  <motion.button
                    type="button"
                    whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    disabled={quantity >= 20}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-background disabled:opacity-30 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    aria-label="주문 수량 1개 늘리기"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Option Groups */}
          {product.optionGroups && product.optionGroups.length > 0 && (
            <div className="flex flex-col gap-6 pt-2">
              {product.optionGroups.map((group) => {
                const selectedIds = selections[group.id] || [];
                const isSingle = group.selectionType === "single";

                return (
                  <div key={group.id} className="flex flex-col gap-3">
                    {/* Visual Header */}
                    <div className="flex items-center justify-between px-0.5" aria-hidden="true">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-foreground">
                          {group.labelKo}
                        </h3>
                        <span className="text-base text-muted-foreground font-medium">
                          ({isSingle ? "1개 선택" : "다중 선택 가능"})
                        </span>
                      </div>
                      {group.required && (
                        <Badge variant="secondary" className="font-bold text-base bg-primary/10 text-primary border-none rounded-full px-2.5 py-0.5">
                          필수
                        </Badge>
                      )}
                    </div>
                    {/* VoiceOver announcement */}
                    <span className="sr-only">
                      {`${group.labelKo}, ${group.required ? "필수 선택" : "선택 사항"}, ${isSingle ? "1개만 선택 가능" : "다중 선택 가능"}`}
                    </span>

                    <div className="flex flex-col gap-2">
                      {group.options.map((opt) => {
                        const isSelected = selectedIds.includes(opt.id);
                        const priceDescription = opt.priceDelta > 0 ? `추가 금액 ${opt.priceDelta.toLocaleString("ko-KR")}원` : "추가금 없음";

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            onClick={() => handleOptionToggle(group.id, opt.id, isSingle)}
                            aria-pressed={isSelected}
                            aria-label={`${opt.labelKo}, ${priceDescription}`}
                            className={`flex min-h-[56px] items-center justify-between rounded-[18px] border-2 p-3.5 transition-all focus-visible:ring-2 focus-visible:ring-ring outline-none ${
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
                                <span className="text-base font-extrabold tabular-nums">
                                  +{opt.priceDelta.toLocaleString("ko-KR")}원
                                </span>
                              ) : (
                                <span className="text-base text-muted-foreground font-medium">추가금 없음</span>
                              )}
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

      <DrawerFooter className="p-4 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-border/40 bg-background">
        <Button
          size="cta"
          className="w-full font-extrabold text-base rounded-[16px] bg-primary text-white shadow-none"
          onClick={handleSubmit}
        >
          <RollingPrice
            value={totalPrice}
            suffix="원 담기"
            className="font-extrabold text-base text-primary-foreground"
          />
        </Button>
      </DrawerFooter>
    </>
  );
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <ProductDetailContent
          key={product.id}
          product={product}
          onClose={() => onOpenChange(false)}
          onAddToCart={(data) => {
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
