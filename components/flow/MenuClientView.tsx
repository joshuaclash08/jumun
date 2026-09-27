"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation("menu");
  const { t: tCommon } = useTranslation("common");

  const allCategories = React.useMemo<MenuCategory[]>(() => {
    return [{ id: "popular", labelKo: t("popularCategory") }, ...categories];
  }, [categories, t]);

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
  const menuLayout = useAccessibilityStore((state) => state.menuLayout);
  const isProgrammaticScroll = React.useRef(false);

  React.useEffect(() => {
    if (storeInfo) {
      setStoreInfo(storeInfo);
    }
  }, [storeInfo, setStoreInfo]);

  const scrollEndTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deterministic Reading-Line Scrollspy + Staff-call expand/collapse
  // Runs in a single requestAnimationFrame loop without conflicting IntersectionObserver
  // callbacks. Guarantees monotonic category transitions (zero pill bouncing/jittering).
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          if (currentScrollY <= 50) {
            setIsStaffCallExpanded((prev) => (prev ? prev : true));
          } else if (scrollDiff > 8) {
            setIsStaffCallExpanded((prev) => (!prev ? prev : false));
          } else if (scrollDiff < -8) {
            setIsStaffCallExpanded((prev) => (prev ? prev : true));
          }
          lastScrollY.current = currentScrollY;

          // Only compute scrollspy when not animating from a tab click
          if (!isProgrammaticScroll.current) {
            const isNearBottom =
              window.innerHeight + window.scrollY >=
              document.documentElement.scrollHeight - 60;

            if (isNearBottom) {
              const lastCategory = allCategories[allCategories.length - 1];
              if (lastCategory) {
                setActiveCategoryId((prev) => (prev === lastCategory.id ? prev : lastCategory.id));
              }
            } else {
              const headerEl = document.getElementById("menu-category-header");
              const headerHeight = headerEl?.offsetHeight ?? 60;
              const readingLine = headerHeight + 24;

              let currentActiveId = allCategories[0]?.id || "popular";

              for (let i = 0; i < allCategories.length; i++) {
                const cat = allCategories[i];
                const el = document.getElementById(`category-${cat.id}`);
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                if (rect.top <= readingLine) {
                  currentActiveId = cat.id;
                } else {
                  break;
                }
              }

              setActiveCategoryId((prev) => (prev === currentActiveId ? prev : currentActiveId));
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [allCategories]);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const cat = allCategories.find((c) => c.id === id);
    if (cat) {
      const count =
        id === "popular"
          ? products.slice(0, 4).length
          : products.filter((p) => p.category === id).length;
      speak(t("categoryVoice", { category: cat.labelKo, count }));
    }

    isProgrammaticScroll.current = true;

    const clearProgrammaticScroll = () => {
      isProgrammaticScroll.current = false;
      window.removeEventListener("scrollend", clearProgrammaticScroll);
      document.removeEventListener("scrollend", clearProgrammaticScroll);
      window.removeEventListener("wheel", clearProgrammaticScroll);
      window.removeEventListener("touchmove", clearProgrammaticScroll);
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = null;
      }
    };

    window.addEventListener("scrollend", clearProgrammaticScroll, { once: true });
    document.addEventListener("scrollend", clearProgrammaticScroll, { once: true });
    window.addEventListener("wheel", clearProgrammaticScroll, { once: true, passive: true });
    window.addEventListener("touchmove", clearProgrammaticScroll, { once: true, passive: true });

    if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current);
    scrollEndTimeoutRef.current = setTimeout(clearProgrammaticScroll, 1500);

    const headerEl = document.getElementById("menu-category-header");
    const chromeHeight = headerEl?.offsetHeight ?? 60;
    if (id === "popular") {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "instant" : "smooth",
      });
      return;
    }
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - chromeHeight - 8;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: reduceMotion ? "instant" : "smooth",
      });
    }
  };

  const lastFocusedProductCardRef = React.useRef<HTMLElement | null>(null);
  const cartPillButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleProductClick = React.useCallback((product: Product) => {
    lastFocusedProductCardRef.current = (document.activeElement as HTMLElement) || null;
    setTimeout(() => {
      speak(`${product.nameKo}, ${formatKRW(product.price)}`);
    }, 0);
    React.startTransition(() => {
      setSelectedProduct(product);
      setIsProductSheetOpen(true);
    });
  }, [speak]);

  const handleProductSheetOpenChange = (open: boolean) => {
    React.startTransition(() => {
      setIsProductSheetOpen(open);
    });
    if (!open && lastFocusedProductCardRef.current) {
      const trigger = lastFocusedProductCardRef.current;
      setTimeout(() => {
        trigger.focus();
        lastFocusedProductCardRef.current = null;
      }, 60);
    }
  };

  const handleCartDrawerOpenChange = (open: boolean) => {
    React.startTransition(() => {
      setIsCartDrawerOpen(open);
    });
    if (!open) {
      setTimeout(() => {
        cartPillButtonRef.current?.focus();
      }, 60);
    }
  };

  const handleCheckoutSheetOpenChange = (open: boolean) => {
    React.startTransition(() => {
      setIsCheckoutSheetOpen(open);
    });
    if (!open) {
      setTimeout(() => {
        cartPillButtonRef.current?.focus();
      }, 60);
    }
  };

    // Support both 2-column Grid Cards and 1-column accessible Row List
    const isListLayout = menuLayout === "list";
    const categoryGridClass = isListLayout
      ? "grid-cols-1 gap-y-3 sm:gap-y-3.5"
      : "grid-cols-2 sm:grid-cols-3 gap-x-3.5 gap-y-6 sm:gap-x-4 sm:gap-y-8";
    const cardLayout = isListLayout ? "row" : "grid";
    const isMotionDisabled = reduceMotion || process.env.NODE_ENV === "test";

    return (
      <OneHandedContainer>
        <AnimatePresence mode="wait" initial={false}>
          {orderStatus === "confirmed" ? (
            <motion.div
              key="confirmation"
              initial={isMotionDisabled ? false : screenVariants.initial}
              animate={screenVariants.animate}
              exit={isMotionDisabled ? undefined : screenVariants.exit}
              transition={{ duration: isMotionDisabled ? 0 : 0.2, ease: "easeOut" }}
            >
              <ConfirmationStep onReset={resetOrder} />
            </motion.div>
          ) : isWizardMode ? (
            <motion.div
              key="wizard"
              initial={isMotionDisabled ? false : screenVariants.initial}
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
              initial={false}
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
                <div className="flex flex-col gap-12 sm:gap-14 px-4">
                  {categories
                    .map((category) => ({
                      category,
                      categoryProducts: products.filter((p) => p.category === category.id),
                    }))
                    .filter(({ categoryProducts }) => categoryProducts.length > 0)
                    .map(({ category, categoryProducts }, visibleIndex) => (
                      <section
                        key={category.id}
                        id={`category-${category.id}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${category.id}`}
                        className="flex flex-col gap-3.5 scroll-mt-[72px]"
                      >
                        <div className="flex items-baseline gap-2 pb-1">
                          <h2
                            id={`heading-${category.id}`}
                            className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight"
                            aria-label={t("categoryHeadingAria", { name: category.labelKo, count: categoryProducts.length })}
                          >
                            {category.labelKo}
                          </h2>
                          <span className="text-base font-bold text-muted-foreground tabular-nums" aria-hidden="true">
                            {tCommon("itemCount", { count: categoryProducts.length })}
                          </span>
                        </div>

                        <div className={`grid ${categoryGridClass}`}>
                          {categoryProducts.map((product, pIndex) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onProductClick={handleProductClick}
                              layout={cardLayout}
                              priority={visibleIndex === 0 && pIndex < 2}
                            />
                          ))}
                        </div>
                      </section>
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
          <div
            id="jumun-bottom-actions"
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 pointer-events-none px-4"
          >
            <div className="mx-auto max-w-[840px] flex items-center w-full">
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
                  buttonRef={cartPillButtonRef}
                  onClick={() => {
                    setTimeout(() => {
                      const itemsCount = useCartStore.getState().items.length;
                      speak(t("cart.voiceOpened", { count: itemsCount }));
                    }, 0);
                    React.startTransition(() => {
                      setIsCartDrawerOpen(true);
                    });
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
          onOpenChange={handleProductSheetOpenChange}
        />

        <CartDrawer
          open={isCartDrawerOpen}
          onOpenChange={handleCartDrawerOpenChange}
          onCheckout={() => {
            setIsCartDrawerOpen(false);
            setIsCheckoutSheetOpen(true);
          }}
        />

        <CheckoutSheet
          open={isCheckoutSheetOpen}
          onOpenChange={handleCheckoutSheetOpenChange}
          onConfirm={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        />
      </OneHandedContainer>
    );
}
