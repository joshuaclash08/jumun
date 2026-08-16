"use client";

import * as React from "react";
import { MenuCategoryHeader } from "./MenuCategoryHeader";
import { ProductCard } from "./ProductCard";
import type { MenuCategory, Product, StoreInfo } from "@/lib/types";
import { CartSummaryPill } from "./CartSummaryPill";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { CartDrawer } from "./CartDrawer";
import { CheckoutSheet } from "./CheckoutSheet";
import { ConfirmationStep } from "./ConfirmationStep";
import { A11yToastContainer } from "./A11yToastContainer";
import { useCartStore } from "@/store/useCartStore";

interface MenuClientViewProps {
  categories: MenuCategory[];
  products: Product[];
  storeInfo?: StoreInfo;
}

export function MenuClientView({ categories, products, storeInfo }: MenuClientViewProps) {
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>(
    categories[0]?.id || ""
  );
  
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false);
  const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = React.useState(false);

  const setStoreInfo = useCartStore((state) => state.setStoreInfo);
  const orderStatus = useCartStore((state) => state.orderStatus);
  const resetOrder = useCartStore((state) => state.resetOrder);
  const isProgrammaticScroll = React.useRef(false);

  React.useEffect(() => {
    if (storeInfo) {
      setStoreInfo(storeInfo);
    }
  }, [storeInfo, setStoreInfo]);

  // Scroll Sync via IntersectionObserver.
  // Short sections (e.g. a 2-item dessert category) can intersect the
  // detection band at the same time as their neighbor, so a single callback
  // batch may contain multiple isIntersecting entries. Picking "whichever
  // came last in entries" (the old behavior) flips the active tab back and
  // forth between the two every frame while scrolling through that boundary
  // -- the visible flicker. Instead, pick the single entry closest to the
  // top of the detection band, and only commit a state update when the
  // winner actually changes.
  React.useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      if (isProgrammaticScroll.current) return;

      const intersecting = entries.filter((entry) => entry.isIntersecting);
      if (intersecting.length === 0) return;

      const topmost = intersecting.reduce((closest, entry) =>
        entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
      );
      const catId = topmost.target.id.replace("category-", "");
      setActiveCategoryId((prev) => (prev === catId ? prev : catId));
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    });

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      isProgrammaticScroll.current = true;
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 600);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductSheetOpen(true);
  };

  if (orderStatus === "confirmed") {
    return <ConfirmationStep onReset={resetOrder} />;
  }

  return (
    <div className="flex w-full flex-col pb-36 relative">
      <MenuCategoryHeader
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategorySelect={handleCategorySelect}
      />
      
      <div className="flex flex-col gap-10 px-4 pt-4">
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.category === category.id
          );
          
          if (categoryProducts.length === 0) return null;

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="flex flex-col gap-4 scroll-mt-24"
              aria-labelledby={`heading-${category.id}`}
            >
              <h2 id={`heading-${category.id}`} className="text-xl font-bold text-foreground">
                {category.labelKo}
              </h2>
              <div className="flex flex-col gap-3">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <CartSummaryPill onClick={() => setIsCartDrawerOpen(true)} />

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

      <A11yToastContainer />
    </div>
  );
}
