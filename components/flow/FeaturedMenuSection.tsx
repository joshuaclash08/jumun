"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductIllustration } from "@/components/ui/TossIllustrations";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface FeaturedMenuSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function FeaturedMenuSection({ products, onProductClick }: FeaturedMenuSectionProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  // Pick top 4 popular items across categories
  const featuredProducts = React.useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  if (featuredProducts.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 pt-1" aria-label="추천 메뉴 목록">
      {/* Horizontal Carousel */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {featuredProducts.map((product) => {
          const Illustration = getProductIllustration(product.icon);

          return (
            <motion.div
              key={`featured-${product.id}`}
              whileTap={!product.available || reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="shrink-0 snap-start w-38 sm:w-44"
            >
              <button
                type="button"
                onClick={() => onProductClick(product)}
                disabled={!product.available}
                aria-label={`${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원, 추천 메뉴`}
                className="group w-full h-full text-left outline-none rounded-[22px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="flex flex-col h-full items-center p-3 gap-2 rounded-[22px] bg-card border-none shadow-none transition-all hover:bg-muted/30">
                  {/* Illustration Tile */}
                  <div
                    className="relative flex h-28 w-full shrink-0 items-center justify-center rounded-[18px] overflow-hidden"
                    aria-hidden="true"
                  >
                    <Illustration size={68} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-base px-2.5 py-0.5 font-bold rounded-full bg-primary/10 text-primary border-none"
                    >
                      BEST
                    </Badge>
                  </div>

                  {/* Info (fluid auto-height for titles) */}
                  <div className="flex flex-1 flex-col justify-between w-full text-left gap-1 px-0.5" aria-hidden="true">
                    <span className="text-base font-bold text-foreground break-keep">
                      {product.nameKo}
                    </span>
                    <span className="text-lg font-extrabold text-foreground tabular-nums mt-auto pt-0.5">
                      {product.price.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
