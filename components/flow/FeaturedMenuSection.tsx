"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
          const fallbackBg = "#F4F4F6";
          const cardBg = product.themeBg || fallbackBg;

          return (
            <motion.div
              key={`featured-${product.id}`}
              whileTap={!product.available || reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="shrink-0 snap-start w-38 sm:w-44"
            >
              <button
                type="button"
                onClick={() => onProductClick(product)}
                disabled={!product.available}
                aria-label={`${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원, 추천 메뉴`}
                style={{ backgroundColor: cardBg }}
                className="group relative flex w-full aspect-[4/5] sm:aspect-[1/1] min-h-[180px] text-left outline-none rounded-[22px] overflow-hidden border border-black/6 dark:border-white/10 shadow-resting focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow duration-200 hover:shadow-md"
              >
                {/* Full-bleed Studio Photo -- the info panel below overlays its bottom
                    edge so the blur has an actual photo behind it to blur. */}
                <div className="absolute inset-0" aria-hidden="true">
                  <Image
                    src={product.imageUrl}
                    alt={product.nameKo}
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                  />
                </div>
                <Badge
                  variant="secondary"
                  className="absolute top-2.5 left-2.5 text-base px-2 py-0.5 font-bold rounded-[8px] bg-[#F04452] text-white border-none shadow-sm z-20"
                >
                  BEST
                </Badge>

                {/* Bottom: Color-matched glassmorphic info panel -- tint and blur both
                    fade out via the same mask gradient, blending into the photo. */}
                <div
                  style={{ backgroundColor: `${cardBg}4D` }} // ~30% alpha -- liquid-glass level, not a near-solid block
                  className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-3 pt-16 pb-3 gap-0.5 backdrop-blur-sm [mask-image:linear-gradient(to_top,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent_100%)]"
                  aria-hidden="true"
                >
                  <span className="text-[15px] sm:text-base font-extrabold text-[#191F28] break-keep line-clamp-2">
                    {product.nameKo}
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#191F28] tabular-nums tracking-tight pt-0.5">
                    {product.price.toLocaleString("ko-KR")}원
                  </span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
