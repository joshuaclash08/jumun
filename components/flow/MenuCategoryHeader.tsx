"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/types";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface MenuCategoryHeaderProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onCategorySelect: (id: string) => void;
  /** 0 (section's big heading fully expanded) -> 1 (fully collapsed into
   * this tab), mirroring whichever category is currently mid-scroll-morph.
   * Lets the active tab's label crossfade in sync with its heading
   * collapsing away, instead of an instant className swap. */
  activeTransitionProgress?: MotionValue<number>;
  className?: string;
}

export function MenuCategoryHeader({
  categories,
  activeCategoryId,
  onCategorySelect,
  activeTransitionProgress,
  className,
}: MenuCategoryHeaderProps) {
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);
  const navRef = React.useRef<HTMLElement | null>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollAnimationRef = React.useRef<{ stop: () => void } | null>(null);
  const fallbackTransitionProgress = useMotionValue(1);
  const transitionProgress =
    activeTransitionProgress ?? fallbackTransitionProgress;
  const activeLabelOpacity = useTransform(
    transitionProgress,
    [0, 1],
    [0.85, 1],
  );
  const activeLabelScale = useTransform(transitionProgress, [0, 1], [0.94, 1]);

  // Single persistent pill -- never unmounted/remounted between categories,
  // just repositioned via transform. Avoids the mount/unmount + layout
  // (FLIP) measurement cost a per-button layoutId pill pays on every
  // category change, which is what made fast scrolling feel laggy.
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

  // Auto-scroll the active tab into center view as user scrolls page.
  // Debounced so a fast scroll (which can flip activeCategoryId many times
  // a second) doesn't restart a competing scroll on every change -- it
  // waits for the category to settle before centering it. Centering itself
  // is a hand-driven tween (native `behavior: "smooth"` has a fixed, fast
  // browser-default duration that feels like a jump on longer distances).
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

        scrollAnimationRef.current?.stop();

        if (reduceMotion) {
          container.scrollLeft = targetScrollLeft;
          return;
        }

        scrollAnimationRef.current = animate(
          container.scrollLeft,
          targetScrollLeft,
          {
            type: "tween",
            ease: "easeOut",
            duration: 0.45,
            onUpdate: (value) => {
              container.scrollLeft = value;
            },
          },
        );
      },
      reduceMotion ? 0 : 120,
    );

    return () => window.clearTimeout(timeoutId);
  }, [activeCategoryId, reduceMotion]);

  return (
    <div id="menu-category-header" className="sticky top-0 z-40 flex w-full items-center py-2.5">
      {/* Horizontally Scrollable Categories with Smooth Left/Right Edge Fade Mask */}
      <motion.nav
        ref={navRef}
        layoutScroll
        data-lenis-prevent=""
        aria-label="메뉴 카테고리"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)",
        }}
        className={cn("w-full overflow-x-auto scrollbar-none", className)}
      >
        <div className="relative flex w-max gap-2 px-6">
          {indicatorRect && (
            <motion.div
              layout
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 400, damping: 30 }
              }
              style={{ left: indicatorRect.left, width: indicatorRect.width }}
              className="absolute inset-y-0 z-10 rounded-full bg-primary shadow-none"
            />
          )}
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
                  "relative rounded-full px-4.5 py-2 text-base font-bold transition-all",
                  isActive
                    ? "text-primary-foreground font-extrabold"
                    : "bg-[#F2F4F6] text-muted-foreground hover:text-foreground hover:bg-[#E5E8EB]",
                )}
              >
                {/* Above the sliding indicator (z-10) so labels stay
                    readable while it passes underneath, and the active
                    label stays legible once the indicator settles there. */}
                <motion.span
                  className="relative z-20"
                  style={
                    isActive && !reduceMotion
                      ? { opacity: activeLabelOpacity, scale: activeLabelScale }
                      : undefined
                  }
                >
                  {category.labelKo}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
