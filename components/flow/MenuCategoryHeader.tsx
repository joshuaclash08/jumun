"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const navRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});



  // Single persistent pill repositioned via GPU-accelerated translateX spring.
  // Avoids conflicting layout FLIP measurements and width distortion glitches.
  const [indicatorRect, setIndicatorRect] = React.useState<{
    left: number;
    width: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    const targetButton = buttonRefs.current[activeCategoryId];
    if (targetButton) {
      setIndicatorRect({
        left: targetButton.offsetLeft,
        width: targetButton.offsetWidth,
      });
    }
  }, [activeCategoryId, categories]);

  // Auto-scroll the active tab into center view natively on compositor thread.
  // Debounced so fast vertical scrolling does not stutter the tab bar.
  React.useEffect(() => {
    const container = navRef.current;
    const targetButton = buttonRefs.current[activeCategoryId];
    if (!container || !targetButton) return;

    const timeoutId = window.setTimeout(
      () => {
        const containerWidth = container.clientWidth;
        const buttonOffsetLeft = targetButton.offsetLeft;
        const buttonWidth = targetButton.offsetWidth;
        const targetScrollLeft = Math.max(
          0,
          buttonOffsetLeft - containerWidth / 2 + buttonWidth / 2,
        );

        container.scrollTo({
          left: targetScrollLeft,
          behavior: reduceMotion ? "instant" : "smooth",
        });
      },
      reduceMotion ? 0 : 80,
    );

    return () => window.clearTimeout(timeoutId);
  }, [activeCategoryId, reduceMotion]);

  // WAI-ARIA tablist keyboard navigation (roving tabindex)
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const tabCount = categories.length;
    let nextIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % tabCount;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + tabCount) % tabCount;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabCount - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const nextCategory = categories[nextIndex];
    if (nextCategory) {
      buttonRefs.current[nextCategory.id]?.focus();
      onCategorySelect(nextCategory.id);
    }
  };

  // Scroll overflow & direction tracking: remove right fade mask when all tabs
  // fit within the container (e.g. Pixel 9 Pro Fold 836px, desktop, wide screens).
  const [canScroll, setCanScroll] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    setCanScroll(hasOverflow);
    if (hasOverflow) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, []);

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    updateScrollState();
    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    ro?.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro?.disconnect();
    };
  }, [categories, updateScrollState]);

  const maskStyle = React.useMemo(() => {
    if (!canScroll) return undefined;
    const leftFade = canScrollLeft ? "transparent 0%, black 20px" : "black 0%";
    const rightFade = canScrollRight ? "black calc(100% - 20px), transparent 100%" : "black 100%";
    const gradient = `linear-gradient(to right, ${leftFade}, ${rightFade})`;
    return {
      maskImage: gradient,
      WebkitMaskImage: gradient,
    };
  }, [canScroll, canScrollLeft, canScrollRight]);

  return (
    <div
      id="menu-category-header"
      className={cn(
        "sticky top-0 z-40 flex w-full items-center py-2.5 transition-[background-color,border-color] duration-200 ease-out",
        "bg-background border-b border-border/60",
        "shadow-[0_4px_12px_rgba(0,0,0,0.03)] [clip-path:inset(0px_0px_-16px_0px)]",
      )}
    >
      {/* Horizontally Scrollable Categories with Smooth Dynamic Edge Fade Mask */}
      <div
        ref={navRef}
        tabIndex={-1}
        style={maskStyle}
        className={cn("w-full overflow-x-auto scrollbar-none outline-none", className)}
      >
        <div
          role="tablist"
          aria-label={t("categoriesAria")}
          className="relative flex w-max gap-2 px-4"
        >
          {indicatorRect && (
            <motion.div
              initial={false}
              animate={{
                x: indicatorRect.left,
                width: indicatorRect.width,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 450, damping: 32 }
              }
              style={{ left: 0 }}
              className="absolute inset-y-0 z-10 rounded-full bg-primary shadow-none pointer-events-none"
              aria-hidden="true"
            />
          )}
          {categories.map((category, index) => {
            const isActive = category.id === activeCategoryId;
            return (
              <motion.button
                key={category.id}
                ref={(el) => {
                  buttonRefs.current[category.id] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={`category-${category.id}`}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, index)}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => onCategorySelect(category.id)}
                className={cn(
                  "relative rounded-full px-4.5 py-2 text-base font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 select-none",
                  isActive
                    ? "text-primary-foreground font-extrabold"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span className="relative z-20">
                  {category.id === "popular" ? t("popularCategory") : category.labelKo}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
