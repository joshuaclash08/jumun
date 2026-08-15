"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { Product, CartItemSelection } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";

interface ProductDetailSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const addItem = useCartStore((state) => state.addItem);

  // State for selected options
  const [selections, setSelections] = React.useState<Record<string, string[]>>(
    {}
  );

  // Reset selections when product changes
  React.useEffect(() => {
    if (product) {
      const initial: Record<string, string[]> = {};
      product.optionGroups.forEach((group) => {
        if (group.required && group.options.length > 0) {
          initial[group.id] = [group.options[0].id];
        } else {
          initial[group.id] = [];
        }
      });
      setSelections(initial);
    }
  }, [product]);

  if (!product) return null;

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

  const calculateTotalPrice = () => {
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

  const handleAddToCart = () => {
    // Validate required options
    for (const group of product.optionGroups) {
      if (group.required && (!selections[group.id] || selections[group.id].length === 0)) {
        // In a real app, we might show a validation toast
        return;
      }
    }

    const formattedSelections: CartItemSelection[] = Object.entries(
      selections
    ).map(([groupId, optionIds]) => ({
      groupId,
      optionIds,
    }));

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      quantity: 1,
      selections: formattedSelections,
      unitPrice: calculateTotalPrice(),
    });

    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl font-bold">{product.nameKo}</DrawerTitle>
          <DrawerDescription className="text-base text-muted-foreground">
            {product.descriptionKo}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-none">
          <div className="flex flex-col gap-8">
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
                      <span className="rounded-full bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">
                        필수
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedIds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionToggle(group.id, opt.id, isSingle)}
                          aria-pressed={isSelected}
                          className={`flex items-center justify-between rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none active:scale-[0.98] ${
                            isSelected
                              ? "border-primary bg-primary/5 font-semibold text-primary"
                              : "border-border bg-card text-foreground"
                          }`}
                        >
                          <span>{opt.labelKo}</span>
                          {opt.priceDelta > 0 && (
                            <span>+{opt.priceDelta.toLocaleString("ko-KR")}원</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DrawerFooter className="pt-2 pb-[env(safe-area-inset-bottom)] border-t bg-background/80 backdrop-blur-md">
          <Button
            size="lg"
            className="h-16 w-full rounded-2xl text-lg font-bold"
            onClick={handleAddToCart}
          >
            {calculateTotalPrice().toLocaleString("ko-KR")}원 담기
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
