"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  // Concise accessible name for fast VoiceOver navigation across menu items
  const baseLabel = `${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원`;
  const ariaLabel = product.available ? baseLabel : `${baseLabel}, 품절된 상품입니다`;

  return (
    <motion.div
      whileTap={!product.available || reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!product.available}
        aria-label={ariaLabel}
        className={cn(
          "group w-full text-left outline-none rounded-[22px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !product.available && "cursor-not-allowed",
          className
        )}
      >
        <Card
          aria-hidden="true"
          className={cn(
            "flex flex-col h-full w-full rounded-[22px] bg-card p-2.5 sm:p-3 border-none shadow-none transition-all hover:bg-muted/30",
            !product.available && "opacity-60 bg-muted/20"
          )}
        >
          {/* Top: Seamless Visual Tile without box bg, bottom-to-top gradient fade into photo */}
          <div
            className={cn(
              "relative flex h-28 sm:h-34 w-full shrink-0 items-center justify-center rounded-[18px] overflow-hidden bg-muted/30",
              !product.available && "grayscale"
            )}
            aria-hidden="true"
          >
            <Image
              src={product.imageUrl}
              alt={product.nameKo}
              fill
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Bottom-to-top gradient fade: blur/color reduces as it goes up toward the photo */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />

            {/* Status / Discount Badge */}
            {!product.available ? (
              <Badge
                variant="outline"
                className="absolute top-2 left-2 bg-black/65 px-2.5 py-0.5 text-base font-bold text-white border-none rounded-full"
              >
                품절
              </Badge>
            ) : null}
          </div>

          {/* Bottom: Info Section (fluid vertical expansion for 1, 2, 3+ line titles) */}
          <div className="flex flex-1 flex-col justify-between w-full gap-1.5 pt-2 pb-0.5 px-1">
            <h3 className="text-base font-bold leading-snug text-foreground break-keep">
              {product.nameKo}
            </h3>

            <div className="flex items-baseline justify-between pt-0.5 mt-auto">
              <span className="text-lg font-extrabold text-foreground tabular-nums">
                {product.price.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
        </Card>
      </button>
    </motion.div>
  );
}

