"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: "sm" | "default" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    data-size={size}
    className={cn(
      // No outline-none/ring-* here -- relies on the global :focus-visible
      // outline (globals.css), same reasoning as button.tsx.
      "peer group/checkbox relative flex shrink-0 cursor-pointer items-center justify-center rounded-[8px] border-2 border-[#D1D6DB] bg-white transition-all duration-150",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[size=sm]:h-5 data-[size=sm]:w-5 data-[size=sm]:rounded-[6px]",
      "data-[size=default]:h-6 data-[size=default]:w-6 data-[size=default]:rounded-[8px]",
      "data-[size=lg]:h-7 data-[size=lg]:w-7 data-[size=lg]:rounded-[9px]",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current transition-none"
    >
      <Check
        className={cn(
          "stroke-[3.2] text-white",
          size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
