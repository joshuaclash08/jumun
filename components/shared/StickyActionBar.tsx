import * as React from "react";

import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  children: React.ReactNode;
  position?: "fixed" | "absolute";
  className?: string;
}

/**
 * Standardized sticky bottom action bar: gradient fade, safe-area padding,
 * mask-image fade, and backdrop-blur. Previously duplicated (with small
 * drifts) across ProductDetailSheet, CartDrawer, CheckoutSheet, and
 * ConfirmationStep.
 */
export function StickyActionBar({
  children,
  position = "fixed",
  className,
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        position,
        "bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center"
      )}
    >
      <div
        className={cn(
          "w-full pointer-events-auto flex flex-col pt-7 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_80%,transparent_100%)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
