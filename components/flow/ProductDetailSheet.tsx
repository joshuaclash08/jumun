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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, CartItemSelection } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductDetailContentProps {
  product: Product;
  onAddToCart: (item: {
    quantity: number;
    selections: CartItemSelection[];
    unitPrice: number;
    optionsSummary: string;
  }) => void;
}

function getInitialSelections(product: Product): Record<string, string[]> {
  const initial: Record<string, string[]> = {};
  product.optionGroups.forEach((group) => {
    if (group.required && group.options.length > 0) {
      initial[group.id] = [group.options[0].id];
    } else {
      initial[group.id] = [];
    }
  });
  return initial;
}

function ProductDetailContent({ product, onAddToCart }: ProductDetailContentProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const [selections, setSelections] = React.useState<Record<string, string[]>>(() =>
    getInitialSelections(product)
  );
  const [quantity, setQuantity] = React.useState<number>(1);

  const handleOptionToggle = (groupId: string, optionId: string, isSingle: boolean) => {
    setSelections((prev) => {
      const groupSelections = prev[groupId] || [];
      if (isSingle) {
        return { ...prev, [groupId]: [optionId] };
      }
      
      const isSelected = groupSelections.includes(optionId);
      if (isSelected) {
        return {
          ...prev,
          [groupId]: groupSelections.filter((id) => id !== optionId),
        };
      } else {
        return {
          ...prev,
          [groupId]: [...groupSelections, optionId],
        };
      }
    });
  };

  const calculateUnitPrice = () => {
    let total = product.price;
    product.optionGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      group.options.forEach((opt) => {
        if (selectedIds.includes(opt.id)) {
          total += opt.priceDelta;
        }
      });
    });
    return total;
  };

  const getOptionsSummary = (): string => {
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
    for (const group of product.optionGroups) {
      if (group.required && (!selections[group.id] || selections[group.id].length === 0)) {
        return;
      }
    }

    const formattedSelections: CartItemSelection[] = Object.entries(
      selections
    ).map(([groupId, optionIds]) => ({
      groupId,
      optionIds,
    }));

    onAddToCart({
      quantity,
      selections: formattedSelections,
      unitPrice,
      optionsSummary: getOptionsSummary(),
    });
  };

  return (
    <>
      <DrawerHeader className="border-b pb-3">
        <DrawerTitle>{product.nameKo}</DrawerTitle>
        <DrawerDescription className="text-base text-muted-foreground">
          {product.descriptionKo}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none">
        <div className="flex flex-col gap-6">
          {product.optionGroups.map((group) => {
            const selectedIds = selections[group.id] || [];
            const isSingle = group.selectionType === "single";

            return (
              <div key={group.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    {group.labelKo}
                  </h3>
                  {group.required && (
                    <Badge variant="secondary" className="font-bold">
                      필수
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedIds.includes(opt.id);
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        onClick={() => handleOptionToggle(group.id, opt.id, isSingle)}
                        aria-pressed={isSelected}
                        className={`flex min-h-[52px] items-center justify-between rounded-[--radius-md] border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none ${
                          isSelected
                            ? "border-primary bg-primary/5 font-bold text-primary"
                            : "border-border bg-card text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="text-base">{opt.labelKo}</span>
                        {opt.priceDelta > 0 && (
                          <span className="text-sm font-bold">+{opt.priceDelta.toLocaleString("ko-KR")}원</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quantity Stepper */}
          <Card className="flex items-center justify-between p-4 shadow-xs">
            <span className="text-lg font-bold text-foreground">주문 수량</span>
            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-xl font-bold text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                aria-label="수량 1개 줄이기"
              >
                -
              </motion.button>
              <span className="flex w-8 justify-center text-lg font-bold text-foreground" aria-live="polite">
                {quantity}
              </span>
              <motion.button
                type="button"
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                disabled={quantity >= 20}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-xl font-bold text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                aria-label="수량 1개 늘리기"
              >
                +
              </motion.button>
            </div>
          </Card>
        </div>
      </div>

      <DrawerFooter className="pt-3 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
        <Button
          size="cta"
          className="w-full"
          onClick={handleSubmit}
        >
          {totalPrice.toLocaleString("ko-KR")}원 담기
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
          onAddToCart={(data) => {
            addItem({
              id: crypto.randomUUID(),
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
