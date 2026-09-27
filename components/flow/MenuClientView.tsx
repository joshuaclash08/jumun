"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { MenuCategoryHeader } from "./MenuCategoryHeader";
import { FeaturedMenuSection } from "./FeaturedMenuSection";
import { ProductCard } from "./ProductCard";
import { MenuSearchSection } from "./MenuSearchSection";
import type { MenuCategory, Product, StoreInfo } from "@/lib/types";
import { CartSummaryPill } from "./CartSummaryPill";
import { StaffCallButton } from "./StaffCallButton";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { CartDrawer } from "./CartDrawer";
import { CheckoutSheet } from "./CheckoutSheet";
import { ConfirmationStep } from "./ConfirmationStep";
import { WizardOrderView } from "./WizardOrderView";
import { OneHandedContainer } from "@/components/layout/OneHandedContainer";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { useCartStore } from "@/store/useCartStore";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { formatKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

// docs/animation-guide.md §3A's wizard-transition recipe -- menu <-> receipt
// is the one true "screen change" in this flow (everything else is a sheet
// over the menu), so it's the one place that recipe actually applies.
const screenVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

interface MenuClientViewProps {
  categories: MenuCategory[];
  products: Product[];
  storeInfo?: StoreInfo;
}

export function MenuClientView({ categories, products, storeInfo }: MenuClientViewProps) {
  const allCategories = React.useMemo<MenuCategory[]>(() => {
    return [{ id: "popular", labelKo: "인기" }, ...categories];
  }, [categories]);

  const [activeCategoryId, setActiveCategoryId] = React.useState<string>(
    allCategories[0]?.id || "popular"
  );
  
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false);
  const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = React.useState(false);

  const orderMode = useAccessibilityStore((state) => state.orderMode);
  const setOrderMode = useAccessibilityStore((state) => state.setOrderMode);
  const oneHandedMode = useAccessibilityStore((state) => state.oneHandedMode);
  const isWizardMode = orderMode === "wizard";

  const { speak } = useVoiceGuide();

  const [isStaffCallExpanded, setIsStaffCallExpanded] = React.useState(true);
  const lastScrollY = React.useRef(0);

  const setStoreInfo = useCartStore((state) => state.setStoreInfo);
  const orderStatus = useCartStore((state) => state.orderStatus);
  const resetOrder = useCartStore((state) => state.resetOrder);
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const isProgrammaticScroll = React.useRef(false);

  React.useEffect(() => {
    if (storeInfo) {
      setStoreInfo(storeInfo);
    }
  }, [storeInfo, setStoreInfo]);

  // Staff-call button expand/collapse on scroll direction, plus a
  // force-last-category fallback near the very bottom of the page (a short
  // last section can end well above the IntersectionObserver band below and
  // never itself cross it). Deliberately lightweight -- no per-category
  // getBoundingClientRect here; that used to run on every scroll event for
  // all 8 categories and is now the IntersectionObserver effect's job.
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 50) {
        setIsStaffCallExpanded(true);
      } else if (scrollDiff > 8) {
        setIsStaffCallExpanded(false);
      } else if (scrollDiff < -8) {
        setIsStaffCallExpanded(true);
      }
      lastScrollY.current = currentScrollY;

      if (isProgrammaticScroll.current) return;

      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 70;

      if (isNearBottom) {
        const lastCategory = allCategories[allCategories.length - 1];
        if (lastCategory) {
          setActiveCategoryId((prev) => (prev === lastCategory.id ? prev : lastCategory.id));
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [allCategories]);

  // Category scrollspy via IntersectionObserver. rootMargin's top offset is
  // measured live off the sticky #menu-category-header (not a hardcoded
  // guess), since its height changes with fontScale. When several short
  // sections cross the detection band in the same callback batch, only the
  // entry with the largest intersectionRatio wins, and state updates are
  // skipped when the winner already matches the current value -- this is
  // what stops the active-tab flicker on short categories (see
  // docs/archive/2026-08-16-ux-audit.md §2.1).
  React.useEffect(() => {
    const headerEl = document.getElementById("menu-category-header");
    const chromeHeight = headerEl?.getBoundingClientRect().height ?? 60;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!best || entry.intersectionRatio > best.intersectionRatio)
          ) {
            best = entry;
          }
        }
        if (!best) return;

        const nextId = best.target.id.replace("category-", "");
        setActiveCategoryId((prev) => (prev === nextId ? prev : nextId));
      },
      {
        rootMargin: `-${Math.ceil(chromeHeight)}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    allCategories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [allCategories, fontScale]);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const cat = allCategories.find((c) => c.id === id);
    if (cat) {
      const count =
        id === "popular"
          ? products.slice(0, 4).length
          : products.filter((p) => p.category === id).length;
      speak(`${cat.labelKo} 카테고리, ${count}개 메뉴.`);
    }
    const headerEl = document.getElementById("menu-category-header");
    const chromeHeight = headerEl?.getBoundingClientRect().height ?? 60;
    if (id === "popular") {
      isProgrammaticScroll.current = true;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "instant" : "smooth",
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
      return;
    }
    const element = document.getElementById(`category-${id}`);
    if (element) {
      isProgrammaticScroll.current = true;
      const y = element.getBoundingClientRect().top + window.scrollY - chromeHeight - 8;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: reduceMotion ? "instant" : "smooth",
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  };

  const handleProductClick = (product: Product) => {
    speak(product.voiceDescriptionKo || `${product.nameKo}, ${formatKRW(product.price)}`);
    setSelectedProduct(product);
    setIsProductSheetOpen(true);
  };

  // At large font scale, a 2-column grid leaves too little width for long
  // Korean product names (they'd clip or need a line-clamp again -- the exact
  // thing the card redesign removed). Switching to a 1-column row layout
  // gives names ~2.5x more horizontal room instead.
    const isLargeFontScale = fontScale >= 1.15;
    const categoryGridClass = isLargeFontScale ? "grid-cols-1" : "grid-cols-2";
    const cardLayout = isLargeFontScale ? "row" : "grid";
    const isMotionDisabled = reduceMotion || process.env.NODE_ENV === "test";

    return (
      <OneHandedContainer>
        <AnimatePresence mode="wait">
          {orderStatus === "confirmed" ? (
            <motion.div
              key="confirmation"
              initial={isMotionDisabled ? undefined : screenVariants.initial}
              animate={screenVariants.animate}
              exit={isMotionDisabled ? undefined : screenVariants.exit}
              transition={{ duration: isMotionDisabled ? 0 : 0.2, ease: "easeOut" }}
            >
              <ConfirmationStep onReset={resetOrder} />
            </motion.div>
          ) : isWizardMode ? (
            <motion.div
              key="wizard"
              initial={isMotionDisabled ? undefined : screenVariants.initial}
              animate={screenVariants.animate}
              exit={isMotionDisabled ? undefined : screenVariants.exit}
              transition={{ duration: isMotionDisabled ? 0 : 0.2, ease: "easeOut" }}
              className="flex w-full flex-col relative"
            >
              <WizardOrderView
                categories={categories}
                products={products}
                storeInfo={storeInfo}
                onExitWizard={() => setOrderMode("standard")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={isMotionDisabled ? undefined : screenVariants.initial}
              animate={screenVariants.animate}
              exit={isMotionDisabled ? undefined : screenVariants.exit}
              transition={{ duration: isMotionDisabled ? 0 : 0.2, ease: "easeOut" }}
              className="flex w-full flex-col relative"
            >
              {/* Sticky Category Tabs with Pinned Settings Button */}
              <MenuCategoryHeader
                categories={allCategories}
                activeCategoryId={activeCategoryId}
                onCategorySelect={handleCategorySelect}
              />

              {/* Menu Content Container */}
              <div className="flex flex-col gap-8 pt-3.5 pb-36 sm:pb-40">
                {/* Featured / Popular Carousel Section */}
                <FeaturedMenuSection
                  products={products}
                  onProductClick={handleProductClick}
                />

                {/* Categorized Product Sections with Search Section at bottom */}
                <div className="flex flex-col gap-10 px-4">
                  {categories
                    .map((category) => ({
                      category,
                      categoryProducts: products.filter((p) => p.category === category.id),
                    }))
                    .filter(({ categoryProducts }) => categoryProducts.length > 0)
                    .map(({ category, categoryProducts }, visibleIndex) => (
                      <React.Fragment key={category.id}>
                        {visibleIndex > 0 && <Separator />}
                        <section
                          id={`category-${category.id}`}
                          className="flex flex-col gap-3.5 scroll-mt-[72px]"
                          aria-labelledby={`heading-${category.id}`}
                        >
                          <div className="flex items-baseline gap-2 pb-1">
                            <h2
                              id={`heading-${category.id}`}
                              className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight"
                              aria-label={`${category.labelKo}, 총 ${categoryProducts.length}개 메뉴`}
                            >
                              {category.labelKo}
                            </h2>
                            <span className="text-base font-bold text-muted-foreground tabular-nums" aria-hidden="true">
                              {categoryProducts.length}개
                            </span>
                          </div>

                          <div className={`grid ${categoryGridClass} gap-3 sm:gap-4`}>
                            {categoryProducts.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handleProductClick}
                                layout={cardLayout}
                              />
                            ))}
                          </div>
                        </section>
                      </React.Fragment>
                    ))}

                  {/* Bottom Search Section for quick menu lookup */}
                  <MenuSearchSection
                    products={products}
                    categories={categories}
                    onProductClick={handleProductClick}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Action Controls: Staff Call + Cart Summary Pill in unified dynamic bar */}
        {orderStatus !== "confirmed" && !isWizardMode && (
          <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-50 pointer-events-none px-4">
            <div className="mx-auto max-w-[768px] flex items-center w-full">
              <div
                className={cn(
                  "flex items-center gap-3 w-full transition-all duration-200 pointer-events-auto",
                  oneHandedMode === "left" && "w-[82%] sm:w-[84%] mr-auto",
                  oneHandedMode === "right" && "w-[82%] sm:w-[84%] ml-auto"
                )}
              >
                {storeInfo && storeInfo.orderType === "dine-in" && (
                  <StaffCallButton
                    storeInfo={storeInfo}
                    isExpanded={isStaffCallExpanded}
                  />
                )}
                <CartSummaryPill
                  onClick={() => {
                    setIsCartDrawerOpen(true);
                    const itemsCount = useCartStore.getState().items.length;
                    speak(`장바구니를 열었습니다. 총 ${itemsCount}개 메뉴.`);
                  }}
                  showLabel={!storeInfo || storeInfo.orderType !== "dine-in" || !isStaffCallExpanded}
                />
              </div>
            </div>
          </div>
        )}

        <ProductDetailSheet
          product={selectedProduct}
          open={isProductSheetOpen}
          onOpenChange={setIsProductSheetOpen}
        />

        <CartDrawer
          open={isCartDrawerOpen}
          onOpenChange={setIsCartDrawerOpen}
          onCheckout={() => {
            setIsCartDrawerOpen(false);
            setIsCheckoutSheetOpen(true);
          }}
        />

        <CheckoutSheet
          open={isCheckoutSheetOpen}
          onOpenChange={setIsCheckoutSheetOpen}
          onConfirm={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        />
      </OneHandedContainer>
    );
}
