"use client";

import * as React from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/flow/ProductCard";
import { selectPopularProducts } from "@/lib/services/MenuService";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  // Popularity-ranked items only (lib/types/menu.ts's popularityRank), not
  // just whichever 4 happen to sit first in the catalog -- that used to
  // duplicate 3 of 4 items with the category section right below it. Shares
  // its ranking rule with MenuService.getPopularProducts via the same
  // selectPopularProducts helper, so the two can't drift apart.
  const featuredProducts = React.useMemo(() => {
    return selectPopularProducts(products, 4);
  }, [products]);

  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = Math.min(index + 1, featuredProducts.length - 1);
    } else if (e.key === "ArrowLeft") {
      nextIndex = Math.max(index - 1, 0);
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = featuredProducts.length - 1;
    }

    if (nextIndex !== null && nextIndex !== index) {
      e.preventDefault();
      setFocusedIndex(nextIndex);
      const targetCard = cardRefs.current[nextIndex];
      if (targetCard) {
        targetCard.focus();
        targetCard.scrollIntoView?.({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  };

  const carouselRef = React.useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScroll(hasOverflow);
    if (hasOverflow) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, []);

  React.useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    updateScrollState();
    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    ro?.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro?.disconnect();
    };
  }, [featuredProducts, updateScrollState]);

  const maskStyle = React.useMemo(() => {
    if (!canScroll) return undefined;
    const leftFade = canScrollLeft ? "transparent 0%, black 16px" : "black 0%";
    const rightFade = canScrollRight ? "black calc(100% - 16px), transparent 100%" : "black 100%";
    const gradient = `linear-gradient(to right, ${leftFade}, ${rightFade})`;
    return {
      maskImage: gradient,
      WebkitMaskImage: gradient,
    };
  }, [canScroll, canScrollLeft, canScrollRight]);

  if (featuredProducts.length === 0) return null;

  return (
    <section
      id="category-popular"
      className={cn("flex flex-col gap-3.5 scroll-mt-[72px]", className)}
      aria-labelledby="heading-popular"
      role="region"
      aria-roledescription={t("carouselAria")}
    >
      {/* Section Heading matching other category sections */}
      <div className="flex items-baseline gap-2 px-4 pb-1">
        <h2
          id="heading-popular"
          className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight"
          aria-label={t("popularHeadingAria", { count: featuredProducts.length })}
        >
          {t("popularHeading")}
        </h2>
        <span
          className="text-base font-bold text-muted-foreground tabular-nums"
          aria-hidden="true"
        >
          {tCommon("itemCount", { count: featuredProducts.length })}
        </span>
      </div>

      {/* Horizontal Carousel with Dynamic Left/Right Edge Fade Mask */}
      <div
        ref={carouselRef}
        data-lenis-prevent=""
        tabIndex={-1}
        style={maskStyle}
        className="w-full overflow-x-auto scrollbar-none outline-none"
      >
        <div
          role="group"
          aria-label={t("popularListAria")}
          className="flex gap-3 px-4 pb-2 snap-x snap-mandatory w-max"
        >
          {featuredProducts.map((product, index) => (
            <div
              key={`featured-${product.id}`}
              className="shrink-0 snap-start w-38 sm:w-44"
            >
              <ProductCard
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                product={product}
                onProductClick={onProductClick}
                layout="carousel"
                rank={index + 1}
                priority={index < 2}
                tabIndex={index === focusedIndex ? 0 : -1}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(e) => handleCardKeyDown(e, index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
