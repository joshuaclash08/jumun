"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { formatKRW } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
  onClick?: () => void;
  /**
   * 'grid' = photo-above-text 2-column grid card (default).
   * 'row' = compact list row: a smaller square photo on the left plus the
   *   same text panel to its right in a horizontal layout, used for a
   *   1-column list mode at large font scales.
   * 'carousel' = same visual treatment as 'grid' but sized for a fixed-width
   *   horizontal-scroll context and can show a rank badge.
   */
  layout?: "grid" | "row" | "carousel";
  /** Only meaningful with layout='carousel' -- shows a small numbered rank chip. */
  rank?: number;
  className?: string;
}

function ProductCardImpl({
  product,
  onProductClick,
  onClick,
  layout = "grid",
  rank,
  className,
}: ProductCardProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  // Rich, full-sentence accessible name sourced from the data's own
  // voice-description field -- falls back to the terse "name, price"
  // pattern only if that field is unexpectedly empty, so nothing ever
  // announces blank.
  const baseLabel =
    product.voiceDescriptionKo || `${product.nameKo}, ${formatKRW(product.price)}`;

  const isRow = layout === "row";
  const showRankChip = layout === "carousel" && typeof rank === "number" && product.available;

  // Carousel cards show a visual (aria-hidden) rank badge -- fold that same
  // popularity rank into the accessible name too, so screen-reader users get
  // the same "인기 N위" context sighted users get from the badge.
  const rankAnnouncement = showRankChip ? `, 인기 ${rank}위 메뉴` : "";
  const ariaLabel = product.available
    ? `${baseLabel}${rankAnnouncement}`
    : `${baseLabel}, 품절된 상품입니다`;

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
    <motion.div
      whileTap={!product.available || reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full h-full"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={!product.available}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full overflow-hidden text-left rounded-[20px] border border-border bg-card shadow-resting transition-colors duration-200 hover:border-input",
          isRow ? "flex-row items-stretch" : "flex-col",
          !product.available && "cursor-not-allowed",
          className
        )}
      >
        {/* Photo area -- fixed aspect ratio, never itself dimmed so the
            sold-out badge (a sibling inside it) keeps full contrast. */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden",
            isRow
              ? "h-28 w-28 aspect-square rounded-[16px] m-2"
              : "aspect-[4/3] w-full rounded-t-[20px]"
          )}
        >
          <div
            className={cn("absolute inset-0", !product.available && "grayscale opacity-60")}
            style={{ backgroundColor: product.themeBg || "#F4F4F6" }}
          >
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes={
                isRow
                  ? "112px"
                  : layout === "carousel"
                    ? "176px"
                    : "(max-width: 640px) 50vw, 240px"
              }
              className="object-cover"
            />
          </div>

          {!product.available ? (
            <Badge
              variant="outline"
              className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/80 px-2.5 py-0.5 text-base font-bold text-white border-none rounded-[8px]"
            >
              <Ban className="h-3.5 w-3.5" aria-hidden="true" />
              품절
            </Badge>
          ) : null}

          {showRankChip ? (
            <div
              className="absolute top-2.5 left-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-[8px] bg-black/65 text-white backdrop-blur-md text-sm font-black shadow-sm"
              aria-hidden="true"
            >
              {rank}
            </div>
          ) : null}
        </div>

        {/* Text panel -- solid card surface, not glassmorphic, grows with content. */}
        <div
          className={cn(
            "flex flex-col gap-1 bg-card px-3 py-3 text-card-foreground",
            isRow && "min-w-0 flex-1 justify-center"
          )}
        >
          <h3 className="text-base font-bold break-keep">{product.nameKo}</h3>
          <span className="text-base font-bold tabular-nums text-card-foreground">
            {formatKRW(product.price)}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export const ProductCard = React.memo(ProductCardImpl);
