"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";

interface MenuCategoryHeaderProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onCategorySelect: (id: string) => void;
  className?: string;
}

export function MenuCategoryHeader({
  categories,
  activeCategoryId,
  onCategorySelect,
  className,
}: MenuCategoryHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-auto bg-background/80 px-4 py-3 backdrop-blur-md",
        "scrollbar-none", // Assuming hide scrollbar util
        className
      )}
    >
      <div className="flex w-max gap-2">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:bg-surface/80"
              )}
            >
              {category.labelKo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
