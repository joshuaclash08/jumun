"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
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

  const fallbackBg = "#F4F4F6";
  const cardBg = product.themeBg || fallbackBg;

  return (
    <motion.div
      whileTap={!product.available || reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full h-full"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!product.available}
        aria-label={ariaLabel}
        style={{ backgroundColor: cardBg }}
        className={cn(
          "group relative flex w-full aspect-[4/5] sm:aspect-[1/1] min-h-[190px] text-left outline-none rounded-[22px] overflow-hidden border border-black/6 dark:border-white/10 shadow-resting focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow duration-200 hover:shadow-md",
          !product.available && "cursor-not-allowed opacity-60",
          className
        )}
      >
        {/* Full-bleed Studio Food Photo -- the info panel below overlays its bottom edge
            rather than sitting in its own stacked block, so the blur has an actual photo
            behind it to blur instead of just blurring a flat matching color. */}
        <div
          className={cn("absolute inset-0", !product.available && "grayscale")}
          aria-hidden="true"
        >
          <Image
            src={product.imageUrl}
            alt={product.nameKo}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-106"
          />
        </div>

        {/* Status Badge */}
        {!product.available ? (
          <Badge
            variant="outline"
            className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/80 px-2.5 py-0.5 text-base font-bold text-white border-none rounded-[8px]"
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
            품절
          </Badge>
        ) : null}

        {/* Bottom: Color-matched glassmorphic info panel -- the tint and the blur both
            fade out via the same mask gradient, so it blends into the photo instead of
            cutting off at a hard seam. */}
        <div
          style={{ backgroundColor: `${cardBg}4D` }} // ~30% alpha -- liquid-glass level, not a near-solid block
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end px-3 sm:px-3.5 pt-16 sm:pt-20 pb-3 sm:pb-3.5 gap-0.5 backdrop-blur-sm [mask-image:linear-gradient(to_top,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_30%,transparent_100%)]"
        >
          <h3 className="text-[15px] sm:text-base font-extrabold leading-snug text-[#191F28] break-keep line-clamp-2">
            {product.nameKo}
          </h3>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-base sm:text-lg font-black text-[#191F28] tabular-nums tracking-tight">
              {product.price.toLocaleString("ko-KR")}원
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}


