"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

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
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const activeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  // Auto-scroll the active tab into view when activeCategoryId changes
  React.useEffect(() => {
    if (activeButtonRef.current) {
      activeButtonRef.current.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategoryId, reduceMotion]);

  return (
    <nav
      aria-label="메뉴 카테고리"
      className={cn(
        "sticky top-0 z-40 w-full overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur-md border-b border-border/40",
        className
      )}
    >
      <div className="flex w-max gap-1">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <motion.button
              key={category.id}
              ref={isActive ? (el) => { activeButtonRef.current = el; } : undefined}
              type="button"
              aria-current={isActive ? "true" : undefined}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={reduceMotion ? undefined : "activeCategoryPill"}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-primary -z-10"
                />
              )}
              {category.labelKo}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
