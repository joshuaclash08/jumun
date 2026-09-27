import * as React from "react";

import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  position?: "fixed" | "absolute";
  className?: string;
}

/**
 * Standardized sticky bottom action bar: gradient fade and safe-area padding.
 * Previously duplicated across ProductDetailSheet, CartDrawer, CheckoutSheet,
 * and ConfirmationStep.
 */
export function StickyActionBar({
  children,
  position = "fixed",
  className,
}: StickyActionBarProps) {
  return (
    <div
      data-sticky-action-bar="true"
      className={cn(
        position,
        "bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center"
      )}
    >
      <div
        className={cn(
          "w-full pointer-events-auto flex flex-col pt-7 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
