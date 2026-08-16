"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  Coffee,
  CupSoda,
  Candy,
  Citrus,
  Leaf,
  Milk,
  CakeSlice,
  Cookie,
  Sandwich,
  EggFried,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  className?: string;
}

// product.icon names one of these exports directly (see lib/data/menu.json) --
// one icon per item, not per category, so items in the same category stay
// visually distinguishable in the list (docs/design-system.md's Imagery spec).
// Named imports (not a `* as` namespace lookup) so unused lucide-react icons
// tree-shake out of the bundle.
const PRODUCT_ICONS: Record<string, LucideIcon> = {
  Coffee,
  CupSoda,
  Candy,
  Citrus,
  Leaf,
  Milk,
  CakeSlice,
  Cookie,
  Sandwich,
  EggFried,
};

// A tint per category, not the brand accent -- keeps Jumun Blue reserved for
// the One Accent Rule (primary actions / selection) while still giving the
// menu list some color instead of one flat gray tile repeated on every row.
// Two-tone (soft fill + a darker foreground of the same hue), no gradients,
// matching docs/design-system.md's Imagery spec.
const CATEGORY_TINT: Record<ProductCategory, string> = {
  coffee: "bg-amber-100 text-amber-800",
  beverage: "bg-sky-100 text-sky-700",
  dessert: "bg-pink-100 text-pink-700",
  food: "bg-orange-100 text-orange-800",
};

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  // Use voice description if provided, otherwise fallback to name and price.
  const baseLabel = product.voiceDescriptionKo || `${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원`;
  const ariaLabel = product.available ? baseLabel : `${baseLabel}, 품절된 상품입니다`;

  const Icon = PRODUCT_ICONS[product.icon] ?? UtensilsCrossed;

  return (
    <motion.div
      whileTap={!product.available || reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!product.available}
        aria-label={ariaLabel}
        className={cn(
          "w-full text-left outline-none rounded-[--radius-md] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !product.available && "cursor-not-allowed",
          className
        )}
      >
        <Card
          className={cn(
            "group relative flex w-full min-h-[96px] items-center gap-3 rounded-[--radius-md] bg-card p-3 shadow-resting transition-colors",
            !product.available && "opacity-50 bg-muted/40"
          )}
        >
          {/* Per-item icon -- fixed 1:1 container, flat 2-tone illustration treatment */}
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-[--radius-sm]",
              product.available ? CATEGORY_TINT[product.category] : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <Icon className="h-7 w-7 stroke-[1.5]" />
          </div>

          <div className="flex flex-1 min-w-0 flex-col gap-0.5 text-left">
            <h3 className="text-base font-bold leading-tight text-card-foreground">
              {product.nameKo}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.descriptionKo}
            </p>
            <div className="mt-1 font-bold text-base text-foreground">
              {product.price.toLocaleString("ko-KR")}원
            </div>
          </div>

          {!product.available && (
            <Badge
              variant="outline"
              className="absolute right-3 top-3 bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border-border"
            >
              품절
            </Badge>
          )}
        </Card>
      </button>
    </motion.div>
  );
}
