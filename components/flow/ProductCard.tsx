import * as React from "react";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  // Use voice description if provided, otherwise fallback to name and price.
  const ariaLabel = product.voiceDescriptionKo || `${product.nameKo}, ${product.price.toLocaleString("ko-KR")}원`;

  return (
    <button
      onClick={onClick}
      disabled={!product.available}
      aria-label={ariaLabel}
      aria-disabled={!product.available}
      className={cn(
        "group relative flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-[0_1px_2px_rgba(33,30,26,0.06),_0_1px_1px_rgba(33,30,26,0.04)] outline-none transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Abstract geometric placeholder instead of actual images (per DESIGN.md) */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-accent"
        aria-hidden="true"
      >
        <span className="text-2xl opacity-20">☕</span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-lg font-bold leading-tight text-card-foreground">
          {product.nameKo}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.descriptionKo}
        </p>
        <div className="mt-1 font-semibold text-card-foreground">
          {product.price.toLocaleString("ko-KR")}원
        </div>
      </div>
      
      {!product.available && (
        <div className="absolute right-4 top-4 rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
          품절
        </div>
      )}
    </button>
  );
}
