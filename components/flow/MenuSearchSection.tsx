"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MenuCategory, Product } from "@/lib/types";
import { ProductCard } from "@/components/flow/ProductCard";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface MenuSearchSectionProps {
  products: Product[];
  categories: MenuCategory[];
  onProductClick: (product: Product) => void;
}

export function MenuSearchSection({
  products,
  categories,
  onProductClick,
}: MenuSearchSectionProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();

  // p.category is the English id ("coffee"), never what a user types --
  // match against the Korean category label instead.
  const categoryLabelById = React.useMemo(
    () => new Map(categories.map((c) => [c.id, c.labelKo])),
    [categories]
  );

  const filteredProducts = React.useMemo(() => {
    if (!trimmedQuery) return [];
    const lower = trimmedQuery.toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.nameKo.toLowerCase().includes(lower);
      const descMatch = p.descriptionKo.toLowerCase().includes(lower);
      const categoryMatch = (categoryLabelById.get(p.category) ?? "")
        .toLowerCase()
        .includes(lower);
      return nameMatch || descMatch || categoryMatch;
    });
  }, [products, trimmedQuery, categoryLabelById]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <section
      aria-labelledby="menu-search-heading"
      className="mt-6 flex flex-col rounded-[26px] bg-muted/40 border border-border/60 p-5 sm:p-6 gap-4"
    >
      {/* Heading & Friendly Subtitle */}
      <div className="flex flex-col gap-1 text-left">
        <h2
          id="menu-search-heading"
          className="text-lg font-extrabold text-foreground leading-snug"
        >
          원하는 메뉴를 못 찾으시겠나요?
        </h2>
      </div>

      {/* Search Bar Input */}
      <div className="relative flex items-center w-full">
        <Search
          className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="메뉴 검색"
          placeholder="메뉴 검색"
          className="h-14 w-full rounded-[18px] border border-border bg-background pl-12 pr-11 text-base font-medium text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="검색어 지우기"
            className="absolute right-1.5 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-muted/80 hover:text-foreground transition-colors">
              <X className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      {/* Live Search Results */}
      <AnimatePresence mode="wait">
        {trimmedQuery && (
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3 pt-2"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-base font-bold text-foreground">
                검색 결과
              </span>
              <span className="text-base font-semibold text-primary">
                {filteredProducts.length}개
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={`search-${product.id}`}
                    product={product}
                    onProductClick={onProductClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <p className="text-base font-bold text-foreground">
                  &lsquo;{trimmedQuery}&rsquo;에 대한 메뉴를 찾지 못했어요
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 rounded-[14px] bg-background border border-border px-4 py-2 text-base font-bold text-primary hover:bg-muted transition-colors"
                >
                  검색어 지우기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
