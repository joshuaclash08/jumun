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
  const navRef = React.useRef<HTMLElement | null>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Auto-scroll the active tab into center view in real-time as user scrolls page
  React.useEffect(() => {
    const container = navRef.current;
    const targetButton = buttonRefs.current[activeCategoryId];
    if (container && targetButton) {
      const containerWidth = container.clientWidth;
      const buttonOffsetLeft = targetButton.offsetLeft;
      const buttonWidth = targetButton.offsetWidth;
      const targetScrollLeft =
        buttonOffsetLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: reduceMotion ? "instant" : "smooth",
      });
    }
  }, [activeCategoryId, reduceMotion]);

  return (
    <div className="sticky top-0 z-40 flex w-full items-center py-2.5">
      {/* <div className="sticky top-0 z-40 flex w-full items-center bg-background/95 backdrop-blur-md py-2.5"> */}
      {/* Horizontally Scrollable Categories with Smooth Left/Right Edge Fade Mask */}
      <nav
        ref={navRef}
        aria-label="메뉴 카테고리"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
        }}
        className={cn(
          "w-full overflow-x-auto scrollbar-none scroll-smooth",
          className,
        )}
      >
        <div className="flex w-max gap-2 px-6">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            return (
              <motion.button
                key={category.id}
                ref={(el) => {
                  buttonRefs.current[category.id] = el;
                }}
                type="button"
                aria-current={isActive ? "true" : undefined}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => onCategorySelect(category.id)}
                className={cn(
                  "relative rounded-full px-4.5 py-2 text-base font-bold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                  isActive
                    ? "text-primary-foreground font-extrabold"
                    : "bg-[#F2F4F6] text-muted-foreground hover:text-foreground hover:bg-[#E5E8EB]",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={reduceMotion ? undefined : "activeCategoryPill"}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-primary shadow-none -z-10"
                  />
                )}
                {category.labelKo}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
