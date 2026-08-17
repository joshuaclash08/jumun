"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface FeaturedMenuSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  className?: string;
}

export function FeaturedMenuSection({
  products,
  onProductClick,
  className,
}: FeaturedMenuSectionProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  // Pick top 4 popular items across categories
  const featuredProducts = React.useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  if (featuredProducts.length === 0) return null;

  return (
    <section
      id="category-popular"
      className={cn("flex flex-col gap-3.5 scroll-mt-[72px]", className)}
      aria-labelledby="heading-popular"
    >
      {/* Section Heading matching other category sections */}
      <div className="flex items-baseline gap-2 px-4 pb-1">
        <h2
          id="heading-popular"
          className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight"
          aria-label={`인기 메뉴, 총 ${featuredProducts.length}개 메뉴`}
        >
          인기 메뉴
        </h2>
        <span
          className="text-base font-bold text-muted-foreground tabular-nums"
          aria-hidden="true"
        >
          {featuredProducts.length}개
        </span>
      </div>

      {/* Horizontal Carousel with Smooth Left/Right Edge Fade Mask */}
      <div
        data-lenis-prevent=""
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)",
        }}
        className="w-full overflow-x-auto scrollbar-none"
      >
        <div className="flex gap-3 px-4 pb-2 snap-x snap-mandatory w-max">
          {featuredProducts.map((product, index) => {
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
                  aria-label={`${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원, 인기 ${index + 1}위 메뉴`}
                  style={{ backgroundColor: cardBg }}
                  className="group relative flex w-full aspect-[4/5] sm:aspect-[1/1] min-h-[185px] text-left rounded-[22px] overflow-hidden border border-black/6 shadow-resting transition-shadow duration-200 hover:shadow-md"
                >
                  {/* Full-bleed Studio Photo */}
                  <div className="absolute inset-0" aria-hidden="true">
                    <Image
                      src={product.imageUrl}
                      alt={product.nameKo}
                      fill
                      sizes="176px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                    />
                  </div>

                  {/* Minimalist Rank Chip: e.g. 1, 2, 3, 4 */}
                  <div
                    className="absolute top-2.5 left-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-[8px] bg-black/65 text-white backdrop-blur-md text-sm font-black shadow-sm"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>

                  {/* Bottom: Color-matched glassmorphic info panel */}
                  <div
                    style={{ backgroundColor: `${cardBg}4D` }}
                    className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-3.5 pt-16 pb-3.5 gap-0.5 backdrop-blur-sm [mask-image:linear-gradient(to_top,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent_100%)]"
                    aria-hidden="true"
                  >
                    <span className="text-[15px] sm:text-base font-extrabold text-[#191F28] break-keep line-clamp-2">
                      {product.nameKo}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#191F28] tabular-nums tracking-[0.6px] pt-0.5">
                      {product.price.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
