"use client";

import * as React from "react";
import { MenuCategoryHeader } from "./MenuCategoryHeader";
import { ProductCard } from "./ProductCard";
import type { MenuCategory, Product } from "@/lib/types";
import { CartSummaryPill } from "./CartSummaryPill";
import { ProductDetailSheet } from "./ProductDetailSheet";
import { CartDrawer } from "./CartDrawer";
import { CheckoutSheet } from "./CheckoutSheet";
import { ConfirmationStep } from "./ConfirmationStep";
import { useCartStore } from "@/store/useCartStore";

interface MenuClientViewProps {
  categories: MenuCategory[];
  products: Product[];
}

export function MenuClientView({ categories, products }: MenuClientViewProps) {
  const [activeCategoryId, setActiveCategoryId] = React.useState<string>(
    categories[0]?.id || ""
  );
  
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isProductSheetOpen, setIsProductSheetOpen] = React.useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = React.useState(false);
  const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = React.useState(false);

  const orderStatus = useCartStore((state) => state.orderStatus);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductSheetOpen(true);
  };

  if (orderStatus === "confirmed") {
    return <ConfirmationStep onReset={() => window.location.reload()} />;
  }

  return (
    <div className="flex w-full flex-col pb-32 relative">
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
              className="flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold text-foreground">
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
          // The orderStatus state changes to "confirmed" which triggers the ConfirmationStep view
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
      />
    </div>
  );
}
