"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-[30px] data-[size=default]:w-[50px]",
        "data-[size=sm]:h-[24px] data-[size=sm]:w-[40px]",
        "data-checked:bg-primary data-unchecked:bg-[#E5E8EB] dark:data-unchecked:bg-muted",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-data-[size=default]/switch:size-[26px] group-data-[size=default]/switch:translate-x-[2px] group-data-[size=default]/switch:data-checked:translate-x-[22px]",
          "group-data-[size=sm]/switch:size-[20px] group-data-[size=sm]/switch:translate-x-[2px] group-data-[size=sm]/switch:data-checked:translate-x-[18px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
