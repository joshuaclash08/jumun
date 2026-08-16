# 12. Top-Left Navigation Standard and 2-Column Large Card Grid Layout

Date: 2026-08-16
Status: Accepted

## Context

Following a UI/UX audit against real Toss mobile reference patterns (Toss Shopping & Order):
1. **Header Navigation Inconsistency**: Overlays and drawers (`CartDrawer`, `StaffCallButton`, `CheckoutSheet`, `QrScannerModal`) previously used top-right `X` buttons with varying sizes (36px, 40px, 44px) and shapes (`rounded-full`), while `/settings` pages used a top-left `<` (`ChevronLeft`) button.
2. **Menu Card Layout Density & Image Legibility**: The main menu used dense horizontal list rows with 56px illustration tiles. While acceptable for simple flat vectors, this format suffers severe legibility loss when transitioning to real food/drink photos.

## Decisions

### 1. Universal Top-Left `<` (ChevronLeft) Back Navigation — 48×48px Round
- **All sub-views, pages, and overlay drawers** feature a standardized **Top-Left `<` Back Button**:
  - 48×48px circular (`h-12 w-12 rounded-full`), `variant="ghost" size="icon"`.
  - Prominent bold icon: `ChevronLeft` (`h-7 w-7 stroke-[2.8]`).
  - Spring tap feedback: `motion.div` with `whileTap={{ scale: 0.90 }}` spring physics.
- Eliminates top-right `X` close buttons across all 5 drawer overlays (`ProductDetailSheet`, `CartDrawer`, `CheckoutSheet`, `StaffCallButton`, `QrScannerModal`), delivering 100% visual consistency with Toss app navigation.

### 2. Action Controls & Header Placement
- **Top HeaderBar**: Standardized top header with store name (`h1`), table badge, and top-right **48×48px circular Settings button (`h-12 w-12 rounded-full border border-border shadow-2xs`)**.
- **Category Navigation with CSS Edge Fade**: `MenuCategoryHeader` spans full width (`sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md py-2.5`) with a CSS linear gradient mask (`mask-image: linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)`) for soft, natural edge dissolving without hard clipping or background bleed-through.
- **Fixed Bottom-Left Staff Call Button**: `StaffCallButton` is fixed at the bottom left (`fixed bottom-5 left-4 z-50`), harmoniously paired with `CartSummaryPill` at `left-22 right-4`.

### 3. 2-Column Borderless Card Grid with Fluid Vertical Title Auto-Expansion
- Replaced boxed card rows with a 2-column borderless card grid matching Toss feed design:
  - **Compact Base Height**: Visual container reduced to `h-28 sm:h-34` with seamless image rendering.
  - **Fluid Vertical Title Auto-Expansion**: Line-clamping removed (`break-keep`, no fixed `min-h`), allowing cards to naturally auto-expand vertically for 2, 3, or more lines of product title without clipping.
  - **Borderless & Clean Canvas**: `border-none shadow-none` on outer card container.
  - **Bottom-to-Top Gradient Fade**: Smooth progressive gradient overlay (`from-card via-card/40 to-transparent`) spanning the bottom of the photo container, reducing blur/color as it ascends toward the crisp image.
  - **Status Badges**: Floating pill tag in top-left (e.g., `BEST`, `품절` with tokenized 16px text floor).
  - **Tactile Physics**: `whileTap={{ scale: 0.96 }}` spring tap feedback.

### 4. Bottom Menu Search Component (`MenuSearchSection`)
- An inviting search card at the bottom of the menu view ("원하는 메뉴를 못 찾으시겠나요?") with real-time multi-field query filtering, keyword tags (`#아메리카노`, `#라떼`), and instant 2-column search results.

### 5. Full-Screen Page-Style Detail View
- `ProductDetailSheet` upgraded with a prominent hero visual container (`h-52 sm:h-60 rounded-[24px]`), categorized option chips with selection bounce animation, tactile quantity stepper, and fixed bottom CTA.

### 6. Toss TDS Tactile Toggle Switch
- `Switch` upgraded from 18.4×32px Radix defaults to Toss TDS standard 50×30px tactile switch with 26px round thumb and smooth spring slide.

### 7. Page-Level Fluid Route Transitions
- Added `app/template.tsx` with Motion-based slide & fade (`y: [8, 0]`, spring physics, zero-duration fallback on `reducedMotion`).

## Consequences

- Navigation is completely unified across both route-level screens and overlay drawers.
- Menu browsing offers high appetite appeal, spacious visual presentation, and seamless category navigation.
- Zero sub-16px text or ESLint warnings remain across the entire codebase.
