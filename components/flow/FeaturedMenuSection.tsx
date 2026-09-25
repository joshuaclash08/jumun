"use client";

import * as React from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/flow/ProductCard";
import { selectPopularProducts } from "@/lib/services/MenuService";

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
  // Popularity-ranked items only (lib/types/menu.ts's popularityRank), not
  // just whichever 4 happen to sit first in the catalog -- that used to
  // duplicate 3 of 4 items with the category section right below it. Shares
  // its ranking rule with MenuService.getPopularProducts via the same
  // selectPopularProducts helper, so the two can't drift apart.
  const featuredProducts = React.useMemo(() => {
    return selectPopularProducts(products, 4);
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
          {featuredProducts.map((product, index) => (
            <div key={`featured-${product.id}`} className="shrink-0 snap-start w-38 sm:w-44">
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                layout="carousel"
                rank={index + 1}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
