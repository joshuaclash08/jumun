"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getChoseong } from "es-hangul";
import type { MenuCategory, Product } from "@/lib/types";
import { ProductCard } from "@/components/flow/ProductCard";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";

function choseongIncludes(target: string, query: string): boolean {
  try {
    const trimmed = query.replace(/\s+/g, "");
    if (!/^[ㄱ-ㅎ]+$/.test(trimmed)) return false;
    const targetChoseong = getChoseong(target).replace(/\s+/g, "");
    return targetChoseong.includes(trimmed);
  } catch {
    return false;
  }
}

function matchesSearchToken(
  token: string,
  fields: {
    koTitle: string;
    enTitle: string;
    koDesc: string;
    enDesc: string;
    catKo: string;
    catEn: string;
  }
): boolean {
  if (!token) return true;
  if (/^[ㄱ-ㅎ]+$/.test(token)) {
    return (
      choseongIncludes(fields.koTitle, token) ||
      choseongIncludes(fields.koDesc, token) ||
      choseongIncludes(fields.catKo, token)
    );
  }
  return (
    fields.koTitle.includes(token) ||
    fields.enTitle.includes(token) ||
    fields.koDesc.includes(token) ||
    fields.enDesc.includes(token) ||
    fields.catKo.includes(token) ||
    fields.catEn.includes(token)
  );
}

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
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();

  const filteredProducts = React.useMemo(() => {
    if (!trimmedQuery) return [];
    const tokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    return products.filter((p) => {
      const cat = categories.find((c) => c.id === p.category);
      const fields = {
        koTitle: (p.title || p.nameKo || "").toLowerCase(),
        enTitle: (p.titleI18n?.languages?.["en-US"] || "").toLowerCase(),
        koDesc: (p.description || p.descriptionKo || "").toLowerCase(),
        enDesc: (p.descriptionI18n?.languages?.["en-US"] || "").toLowerCase(),
        catKo: (cat?.title || cat?.labelKo || "").toLowerCase(),
        catEn: (cat?.titleI18n?.languages?.["en-US"] || "").toLowerCase(),
      };

      return tokens.every((token) => matchesSearchToken(token, fields));
    });
  }, [products, trimmedQuery, categories]);

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
          {t("search.title")}
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
          aria-label={t("search.placeholder")}
          placeholder={t("search.placeholder")}
          className="h-14 w-full rounded-[18px] border border-border bg-background pl-12 pr-11 text-base font-medium text-foreground placeholder:text-muted-foreground focus-visible:border-primary transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t("search.clearAria")}
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
                {t("search.results")}
              </span>
              <span className="text-base font-semibold text-primary">
                {tCommon("itemCount", { count: filteredProducts.length })}
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
                  {t("search.noResults", { query: trimmedQuery })}
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-2 rounded-[14px] bg-background border border-border px-4 py-2 text-base font-bold text-primary hover:bg-muted transition-colors"
                >
                  {t("search.clearButton")}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
