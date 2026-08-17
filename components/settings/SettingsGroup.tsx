"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Rounded card container holding a group of SettingsRows, divided by hairlines. */
export function SettingsGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[24px] bg-card border border-border shadow-resting divide-y divide-border/60",
        className
      )}
    >
      {children}
    </div>
  );
}
