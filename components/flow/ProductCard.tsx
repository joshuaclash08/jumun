"use client";

import * as React from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { formatKRW } from "@/lib/format";
import { useTranslation } from "@/lib/i18n";

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
    ref
  ) {
    const { t } = useTranslation("menu");
    const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

    // Concise accessible name: food name and price only.
    // Screen readers will speak this cleanly without noise.
    const baseLabel = `${product.nameKo}, ${formatKRW(product.price)}`;

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
          !reduceMotion && product.available && "active:scale-[0.98] transition-transform duration-100 ease-out",
          isRow
            ? "flex-row items-center gap-3.5 p-3 rounded-[20px] bg-card border border-border/60 hover:bg-muted/30 shadow-2xs"
            : "flex-col p-1 hover:bg-muted/20",
          !product.available && "cursor-not-allowed opacity-75",
          className
        )}
      >
        {/* Photo area -- fixed aspect ratio, smooth rounded corners, aria-hidden */}
        <div
          aria-hidden="true"
          className={cn(
            "relative shrink-0 overflow-hidden",
            isRow
              ? "h-20 w-20 sm:h-22 sm:w-22 aspect-square rounded-[14px]"
              : "aspect-[4/3] w-full rounded-[16px]"
          )}
        >
          <div
            className={cn("absolute inset-0", !product.available && "grayscale opacity-50")}
            style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
          >
            <Image
              src={product.imageUrl}
              alt=""
              fill
              priority={priority ? true : undefined}
              sizes={
                isRow
                  ? "96px"
                  : layout === "carousel"
                    ? "176px"
                    : "(max-width: 640px) 50vw, 240px"
              }
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {!product.available ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
              <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-bold text-white shadow-md">
                <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                {t("productCard.soldOut")}
              </span>
            </div>
          ) : null}
        </div>

        {/* Text panel -- minimalist, title + price only */}
        <div
          aria-hidden="true"
          className={cn(
            "flex flex-col text-foreground",
            isRow ? "min-w-0 flex-1 justify-center gap-1" : "gap-0.5 pt-2.5 px-0.5",
            !product.available && "opacity-60"
          )}
        >
          <h3
            className={cn(
              "font-bold text-foreground break-keep leading-snug",
              isRow ? "text-base sm:text-lg line-clamp-1" : "text-base line-clamp-2"
            )}
          >
            {product.nameKo}
          </h3>
          {isRow && product.descriptionKo && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-normal">
              {product.descriptionKo}
            </p>
          )}
          <span
            className={cn(
              "font-bold tabular-nums",
              isRow ? "text-base sm:text-lg font-extrabold" : "text-base",
              !product.available ? "text-muted-foreground line-through decoration-1" : "text-foreground"
            )}
          >
            {formatKRW(product.price)}
          </span>
        </div>
      </button>
    );
  }
);

ProductCardImpl.displayName = "ProductCard";

export const ProductCard = React.memo(ProductCardImpl);
