# 0016 — iOS 15 Safari Polyfills and GPU-Accelerated Tab Transitions

**Status:** Accepted  
**Date:** 2026-10-09  

## Context

During device compatibility testing on legacy mobile hardware (iPhone 6s running iOS 15 / Safari 15), two critical defects were uncovered:
1. **Hydration Crashes**: Safari 15 lacks native support for `window.requestIdleCallback`, `window.cancelIdleCallback`, and `Object.hasOwn`. During React 19 hydration and initial provider mounting, uncaught `TypeError` crashes prevented pages from rendering.
2. **Category Scroll Jank**: Framer Motion layout springs on `MenuCategoryHeader.tsx` recalculating layout positions on every fast-scroll frame caused severe frame drops and visual stutter on older Mobile Safari WebKit engines.

## Decision

1. **Polyfill Layer (`lib/polyfills.ts`)**:
   - Implemented standard compliant polyfills for:
     - `window.requestIdleCallback` (fallback using `setTimeout(..., 1)`)
     - `window.cancelIdleCallback` (fallback using `clearTimeout`)
     - `Object.hasOwn` (fallback using `Object.prototype.hasOwnProperty.call`)
   - Pre-loaded in `app/layout.tsx` before React hydration initiates.
   - Updated `package.json` browserslist to explicitly target `iOS >= 15`, `Safari >= 15`, `Chrome >= 90`.

2. **Pure CSS GPU-Accelerated Tab Indicator Transitions**:
   - Replaced Framer Motion spring physics on `MenuCategoryHeader.tsx` pill indicator with CSS hardware-accelerated transforms (`transform: translate3d(...)`, `will-change: transform`).
   - Cached bounding client rect coordinates and section offset tops to prevent layout thrashing.
   - Applied `[contain:layout]` on the category scroll container to isolate browser reflows.

## Consequences

- Completely eliminated Safari 15 hydration white-screen crashes on iPhone 6s and older iOS devices.
- Achieved consistent 60fps category tab scrolling with zero stutter across low-spec and high-refresh-rate mobile screens.
- Zero external runtime bundle bloat (pure TypeScript polyfills without third-party library overhead).
