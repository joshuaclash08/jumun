"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const separatorVariants = cva("shrink-0", {
  variants: {
    variant: {
      hairline:
        "bg-border/60 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
      subtle:
        "bg-border/40 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
      section:
        "bg-muted/80 data-horizontal:h-2 sm:data-horizontal:h-2.5 data-horizontal:w-full data-vertical:w-2 sm:data-vertical:w-2.5 data-vertical:self-stretch",
      bold: "bg-border data-horizontal:h-[2px] data-horizontal:w-full data-vertical:w-[2px] data-vertical:self-stretch",
      labeled: "relative flex items-center justify-center my-4",
    },
    inset: {
      none: "",
      center:
        "data-horizontal:mx-4 data-horizontal:w-[calc(100%-2rem)] data-vertical:my-4 data-vertical:h-[calc(100%-2rem)]",
      leading:
        "data-horizontal:ml-14 data-horizontal:mr-4 data-horizontal:w-[calc(100%-4.5rem)] data-vertical:mt-14 data-vertical:mb-4 data-vertical:h-[calc(100%-4.5rem)]",
    },
  },
  defaultVariants: {
    variant: "hairline",
    inset: "none",
  },
})

export interface SeparatorProps
  extends React.ComponentProps<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  label?: string
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant,
  inset,
  label,
  children,
  ...props
}: SeparatorProps) {
  if (variant === "labeled" || label || (children && orientation === "horizontal")) {
    const textContent = label || children
    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={cn("relative flex items-center justify-center my-4 w-full", className)}
      >
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border/60" />
        </div>
        {textContent && (
          <div className="relative flex justify-center text-base uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">
              {textContent}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants({ variant, inset }), className)}
      {...props}
    />
  )
}

export { Separator, separatorVariants }

