"use client";

import * as React from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";
import { MenuService } from "@/lib/services";

export interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  onClick?: () => void;
  /**
   * 'grid' = photo-above-text 2-column grid card (default).
   * 'row' = compact list row: a smaller square photo on the left plus the
   *   same text panel to its right in a horizontal layout, used for a
   *   1-column list mode at large font scales.
   * 'carousel' = same visual treatment as 'grid' but sized for a fixed-width
   *   horizontal-scroll context.
   */
  layout?: "grid" | "row" | "carousel";
  /** Optional rank number used for screen reader context in carousel layout. */
  rank?: number;
  className?: string;
  tabIndex?: number;
  priority?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
}

const ProductCardImpl = React.forwardRef<HTMLButtonElement, ProductCardProps>(
  function ProductCardImpl(
    {
      product,
      onProductClick,
      onClick,
      layout = "grid",
      rank,
      className,
      tabIndex,
      priority = false,
      onKeyDown,
      onFocus,
    },
    ref,
  ) {
    const { t, language } = useTranslation("menu");
    const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

    const title = MenuService.getLocalizedTitle(product, language);

    // Concise accessible name: food name and price only.
    // Screen readers will speak this cleanly without noise.
    const baseLabel = `${title}, ${formatKRW(product.price)}`;

    const isRow = layout === "row";

    // Carousel cards include popularity rank context for screen readers
    const rankAnnouncement =
      layout === "carousel" && typeof rank === "number" && product.available
        ? t("productCard.popularRankAria", { rank })
        : "";
    const ariaLabel = product.available
      ? `${baseLabel}${rankAnnouncement}`
      : `${baseLabel}${t("productCard.soldOutAria")}`;

    // Sold-out items stay focusable/announced (no `disabled`) so screen-reader
    // users know they exist; the click is just a no-op instead.
    const handleClick = () => {
      if (!product.available) return;
      if (onProductClick) {
        onProductClick(product);
      } else if (onClick) {
        onClick();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onClick={handleClick}
        aria-disabled={!product.available}
        aria-label={ariaLabel}
        className={cn(
          "group flex w-full h-full overflow-hidden text-left rounded-[20px] border-0 bg-transparent transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
          !reduceMotion &&
            product.available &&
            "active:scale-[0.98] transition-transform duration-100 ease-out",
          isRow
            ? "flex-row items-center justify-between gap-4 p-2 sm:p-2.5 rounded-[20px] border-0 shadow-none bg-transparent hover:bg-muted/20"
            : "flex-col p-1 hover:bg-muted/20",
          !product.available && "cursor-not-allowed opacity-75",
          className,
        )}
      >
        {isRow ? (
          <>
            {/* Text panel on the LEFT */}
            <div
              aria-hidden="true"
              className={cn(
                "flex min-w-0 flex-1 flex-col justify-center gap-1 sm:gap-1.5 text-foreground",
                !product.available && "opacity-60",
              )}
            >
              {/* Badges: 인기 / 신규 */}
              {(product.isPopular || (product.popularityRank && product.popularityRank <= 4) || product.isNew) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(product.isPopular || (product.popularityRank && product.popularityRank <= 4)) && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#3182F6] px-2.5 py-0.5 text-[11px] font-bold text-white leading-normal tracking-tight">
                      인기
                    </span>
                  )}
                  {product.isNew && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#F04452] px-2.5 py-0.5 text-[11px] font-bold text-white leading-normal tracking-tight">
                      신규
                    </span>
                  )}
                </div>
              )}

              {/* Product Title */}
              <h3 className="text-base sm:text-lg font-bold text-foreground break-keep line-clamp-2 leading-snug">
                {title}
              </h3>

              {/* Price Display */}
              {product.originalPrice && product.originalPrice > product.price ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-muted-foreground line-through tabular-nums">
                    {formatKRW(product.originalPrice)}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-foreground tabular-nums">
                    {formatKRW(product.price)}
                  </span>
                </div>
              ) : (
                <span
                  className={cn(
                    "text-base sm:text-lg font-extrabold tabular-nums",
                    !product.available
                      ? "text-muted-foreground line-through decoration-1"
                      : "text-foreground",
                  )}
                >
                  {formatKRW(product.price)}
                </span>
              )}
            </div>

            {/* Food photo on the RIGHT */}
            <div
              aria-hidden="true"
              className="relative shrink-0 overflow-hidden h-[88px] w-[88px] sm:h-[96px] sm:w-[96px] aspect-square rounded-[16px]"
            >
              <div
                className={cn(
                  "absolute inset-0",
                  !product.available && "grayscale opacity-50",
                )}
                style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
              >
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  priority={priority ? true : undefined}
                  sizes="96px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {!product.available && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    <Ban className="h-3 w-3" aria-hidden="true" />
                    {t("productCard.soldOut")}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Photo area -- fixed aspect ratio, smooth rounded corners, aria-hidden */}
            <div
              aria-hidden="true"
              className="relative shrink-0 overflow-hidden aspect-[4/3] w-full rounded-[16px]"
            >
              <div
                className={cn(
                  "absolute inset-0",
                  !product.available && "grayscale opacity-50",
                )}
                style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
              >
                <Image
                  src={product.imageUrl}
                  alt=""
                  fill
                  priority={priority ? true : undefined}
                  sizes={
                    layout === "carousel"
                      ? "176px"
                      : "(max-width: 640px) 50vw, 240px"
                  }
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {!product.available && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-base font-bold text-white shadow-md">
                    <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("productCard.soldOut")}
                  </span>
                </div>
              )}
            </div>

            {/* Text panel -- minimalist, title + price only */}
            <div
              aria-hidden="true"
              className={cn(
                "flex flex-col text-foreground gap-0.5 pt-2.5 px-0.5",
                !product.available && "opacity-60",
              )}
            >
              <h3 className="font-bold text-foreground break-keep leading-snug text-base line-clamp-2">
                {title}
              </h3>
              <span
                className={cn(
                  "font-bold tabular-nums text-base",
                  !product.available
                    ? "text-muted-foreground line-through decoration-1"
                    : "text-foreground",
                )}
              >
                {formatKRW(product.price)}
              </span>
            </div>
          </>
        )}
      </button>
    );
  },
);

ProductCardImpl.displayName = "ProductCard";

export const ProductCard = React.memo(ProductCardImpl);
