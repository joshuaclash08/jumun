"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useTranslation } from "@/lib/i18n";
import { MenuService } from "@/lib/services";
import { LayoutGrid, List } from "lucide-react";

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
  const { t, language } = useTranslation("menu");
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const menuLayout = useAccessibilityStore((state) => state.menuLayout);
  const setMenuLayout = useAccessibilityStore((state) => state.setMenuLayout);
  const navRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Tab coordinates cache to eliminate forced synchronous layouts (Layout Thrashing) during scroll.
  const tabRectsRef = React.useRef<Record<string, { left: number; width: number }>>({});
  const [hasMountedTransition, setHasMountedTransition] = React.useState(false);

  // Single persistent pill repositioned via GPU-accelerated CSS translate3d + width transition.
  // Avoids main-thread JS physics loops and keeps 60fps on low-end mobile devices (e.g. iPhone 6s).
  const [indicatorRect, setIndicatorRect] = React.useState<{
    left: number;
    width: number;
  } | null>(null);

  // Measure and cache all tab positions without triggering reflows during active scrolling
  const measureAllTabs = React.useCallback(() => {
    const rects: Record<string, { left: number; width: number }> = {};
    for (const category of categories) {
      const btn = buttonRefs.current[category.id];
      if (btn) {
        rects[category.id] = {
          left: btn.offsetLeft,
          width: btn.offsetWidth,
        };
      }
    }
    tabRectsRef.current = rects;
    const currentRect = rects[activeCategoryId];
    if (currentRect) {
      setIndicatorRect(currentRect);
    }
  }, [categories, activeCategoryId]);

  // Update active indicator position using cached rects when available
  React.useEffect(() => {
    const cached = tabRectsRef.current[activeCategoryId];
    if (cached) {
      setIndicatorRect(cached);
    } else {
      const targetButton = buttonRefs.current[activeCategoryId];
      if (targetButton) {
        const rect = {
          left: targetButton.offsetLeft,
          width: targetButton.offsetWidth,
        };
        tabRectsRef.current[activeCategoryId] = rect;
        setIndicatorRect(rect);
      }
    }
  }, [activeCategoryId]);

  // Auto-scroll the active tab into center view
  const scrollTabIntoCenter = React.useCallback(
    (categoryId: string, smooth = true) => {
      const container = navRef.current;
      const cached = tabRectsRef.current[categoryId];
      const targetButton = buttonRefs.current[categoryId];
      if (!container) return;

      const buttonOffsetLeft = cached?.left ?? targetButton?.offsetLeft;
      const buttonWidth = cached?.width ?? targetButton?.offsetWidth;
      if (buttonOffsetLeft === undefined || buttonWidth === undefined) return;

      const containerWidth = container.clientWidth;
      const targetScrollLeft = Math.max(
        0,
        buttonOffsetLeft - containerWidth / 2 + buttonWidth / 2,
      );

      if (typeof container.scrollTo === "function") {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: reduceMotion || !smooth ? "instant" : "smooth",
        });
      } else {
        container.scrollLeft = targetScrollLeft;
      }
    },
    [reduceMotion],
  );

  // Handle direct tab click: select immediately and center tab smoothly
  const handleTabClick = (categoryId: string) => {
    onCategorySelect(categoryId);
    scrollTabIntoCenter(categoryId, true);
  };

  // During scrollspy updates: defer horizontal centering until scrolling rests (scrollend)
  // to prevent horizontal and vertical scroll animations from competing on older devices.
  React.useEffect(() => {
    const container = navRef.current;
    if (!container) return;

    // Check if the tab is already visible with comfortable margin
    const cached = tabRectsRef.current[activeCategoryId];
    const targetButton = buttonRefs.current[activeCategoryId];
    const buttonLeft = cached?.left ?? targetButton?.offsetLeft;
    const buttonWidth = cached?.width ?? targetButton?.offsetWidth;

    if (buttonLeft === undefined || buttonWidth === undefined) return;

    const containerScrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const buttonRight = buttonLeft + buttonWidth;

    const isComfortablyVisible =
      buttonLeft >= containerScrollLeft + 20 &&
      buttonRight <= containerScrollLeft + containerWidth - 20;

    // If already comfortably visible, no horizontal scroll needed
    if (isComfortablyVisible) return;

    // If outside viewport, center only after vertical scroll rests
    let isCancelled = false;
    const onScrollRest = () => {
      if (isCancelled) return;
      scrollTabIntoCenter(activeCategoryId, true);
    };

    const timer = window.setTimeout(onScrollRest, 120);
    window.addEventListener("scrollend", onScrollRest, { once: true });

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", onScrollRest);
    };
  }, [activeCategoryId, scrollTabIntoCenter]);

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
      handleTabClick(nextCategory.id);
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

    measureAllTabs();
    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measureAllTabs();
            updateScrollState();
          })
        : null;
    ro?.observe(el);

    // Initial render flag to disable entrance sliding glitch
    const rafId = requestAnimationFrame(() => {
      setHasMountedTransition(true);
    });

    return () => {
      el.removeEventListener("scroll", handleScroll);
      ro?.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [categories, measureAllTabs, updateScrollState]);

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
        className={cn("min-w-0 flex-1 overflow-x-auto scrollbar-none outline-none", className)}
      >
        <div
          role="tablist"
          aria-label={t("categoriesAria")}
          className="relative flex w-max gap-2 px-4 [contain:layout]"
        >
          {indicatorRect && (
            <div
              style={{
                transform: `translate3d(${indicatorRect.left}px, 0, 0)`,
                width: `${indicatorRect.width}px`,
                transition:
                  !hasMountedTransition || reduceMotion
                    ? "none"
                    : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), width 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform, width",
              }}
              className="absolute inset-y-0 left-0 z-10 rounded-full bg-primary shadow-none pointer-events-none"
              aria-hidden="true"
            />
          )}
          {categories.map((category, index) => {
            const isActive = category.id === activeCategoryId;
            return (
              <button
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
                onClick={() => handleTabClick(category.id)}
                className={cn(
                  "relative rounded-full px-4.5 py-2 text-base font-bold select-none cursor-pointer",
                  "transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
                  !reduceMotion && "active:scale-[0.96] transition-transform duration-100 ease-out",
                  isActive
                    ? "text-primary-foreground font-extrabold"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span className="relative z-20">
                  {category.id === "popular"
                    ? t("popularCategory")
                    : MenuService.getLocalizedTitle(category, language)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Layout Toggle Button (Grid <-> List) */}
      <div className="shrink-0 pr-3 sm:pr-4 pl-1">
        <button
          type="button"
          title={
            menuLayout === "grid"
              ? t("layout.switchToList")
              : t("layout.switchToGrid")
          }
          aria-label={
            menuLayout === "grid"
              ? t("layout.switchToList")
              : t("layout.switchToGrid")
          }
          onClick={() => setMenuLayout(menuLayout === "grid" ? "list" : "grid")}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 transition-all select-none cursor-pointer",
            !reduceMotion && "active:scale-[0.94] transition-transform duration-100 ease-out",
          )}
        >
          {menuLayout === "grid" ? (
            <List className="h-5 w-5" aria-hidden="true" />
          ) : (
            <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
