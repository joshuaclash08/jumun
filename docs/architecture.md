# Architecture

This document describes the directory structure, architectural patterns, and platform policies of the JUMUN platform.

## Folder structure

```
/app
  layout.tsx              # Root HTML shell (<title> "JUMUN"), Pretendard font loader, theme sync script
  page.tsx                # Landing fallback: QR scan CTA, manual store selector, setup redirection
  providers.tsx           # Global client providers: A11y initialization, live region, toast container
  template.tsx            # Next.js route transition template
  globals.css             # Tailwind v4 @theme design tokens (colors, radii, spacing, focus rings)
  /order/[storeId]/
    page.tsx              # Primary ordering view: resolves ?table=N (QR) or ?type=takeout
    /table/page.tsx       # Dine-in only: table selection grid (TableSelectView)
  /settings/
    page.tsx              # Consolidated settings: screen, display, accessibility, language, recent receipt
    /payment/page.tsx     # Mocked payment method management
  /setup/
    page.tsx              # First-time user accessibility onboarding wizard (SetupGuard)

/components
  /a11y                   # LiveRegionAnnouncer, SkipLink, VisuallyHidden
  /flow                   # Screen-level flow components:
                          # - MenuClientView (main menu orchestrator)
                          # - WizardOrderView (4-step sequential order flow)
                          # - ProductCard (2-col grid / 1-col list)
                          # - ProductDetailSheet (bottom sheet option selector)
                          # - OptionGroupList (unified option group renderer)
                          # - CartDrawer (cart review sheet)
                          # - CartSummaryPill (floating cart summary)
                          # - CheckoutSheet (payment & confirmation sheet)
                          # - ConfirmationStep (order receipt & confetti screen)
                          # - StaffCallButton (floating 6-option call drawer)
                          # - FeaturedMenuSection (top recommended menu carousel)
                          # - MenuSearchSection (es-hangul choseong search)
                          # - OrderTypeSelectView (dine-in vs takeout selection)
                          # - TableSelectView (table selection grid)
                          # - SelectionCard (tactile selection button)
                          # - SetupGuard (onboarding route guard)
                          # - A11yToastContainer (floating portal toast with drawer clearance)
  /layout                 # FlowHeader, HeaderBar, OneHandedContainer
  /settings               # FontScaleSelector, LanguageSelector, OneHandedModeSelector,
                          # OrderModeSelector, MenuLayoutSelector, ThemeModeSelector,
                          # SettingsHeader, SettingsGroup, SettingsRow
  /shared                 # StickyActionBar (fixed bottom action bar with progressive blur)
  /ui                     # Accessible primitives: button, drawer, card, switch, checkbox,
                          # badge, separator, tabs, RollingPrice, TossIllustrations

/hooks
  useHaptics.ts           # Vibration API wrapper with reduced-motion / toggle gating
  useLenisMotionSync.ts   # Synchronizes Lenis smooth scroll with user motion preferences
  useOSDarkModePreference.ts # Detects system dark mode media query
  useReducedMotion.ts     # Detects system prefers-reduced-motion media query
  useVoiceGuide.ts        # Web Speech API wrapper for screen-reader guidance

/store
  useCartStore.ts         # Cart items, store info, order status, last receipt, undo stack
  useAccessibilityStore.ts # Font scale, high contrast, theme, reduced motion, haptics,
                          # one-handed mode, order mode, menu layout (persisted)
  usePaymentStore.ts      # Default payment method preference (card vs easy pay)
  useToastStore.ts        # Global accessible toast notification queue

/lib
  /constants
    setup.ts              # Setup onboarding cookies and localStorage keys
  /data
    menu.json             # Fictional cafe menu: 8 categories, 18 products with photos
    stores.json           # Sample stores and table counts
  /i18n
    /locales/ko           # 6 Korean namespaces: common, landing, menu, orderFlow, settings, setup
    /locales/en           # 6 English namespaces: 100% synchronized
    index.ts              # useTranslation hook and translate() engine
    types.ts              # Type-safe i18n keys and schema
    validator.ts          # Parity validation logic
  /polyfills.ts           # iOS 15 / Safari 15 polyfills (requestIdleCallback, Object.hasOwn)
  /routes.ts              # Type-safe path helpers (orderPath, tablePath, takeoutPath)
  /services
    A11yFeedbackService.ts # Fan-out feedback service (toast + haptics)
    AccessibilityService.ts # Accessibility preset management
    MenuService.ts        # Category and product lookup, localized title getters
    OrderService.ts       # Mocked order submission with simulated latency
    StoreService.ts       # Store metadata lookup
  format.ts               # formatKRW, getCartTotals, getCartItemDisplayName
  utils.ts                # cn() class merge helper, generateUUID()
```

---

## State Architecture

State is cleanly partitioned across 4 focused Zustand stores:

1. **`useCartStore`**:
   - Manages the active shopping cart (`items: CartItem[]`).
   - Tracks `storeInfo` (discriminated union: `dine-in` with `table` number vs `takeout`).
   - Manages `orderStatus` (`"browsing"` $\to$ `"checkout"` $\to$ `"confirmed"`).
   - Stores `lastReceipt` for display on the confirmation screen and settings page.
   - Maintains an undo history stack capped at 5 items for accidental item removal.
   - All cart total calculations are centralized via `getCartTotals(items)`.

2. **`useAccessibilityStore`**:
   - Persists user preferences to `localStorage` under `jumun:accessibility-settings`.
   - Never stores raw medical or disability profiles — only functional UI preferences (font scale, contrast mode, theme, animations, haptics, one-handed mode, order mode, menu layout).
   - Restores settings immediately during SSR/hydration via an inline `<script>` in `app/layout.tsx` to prevent theme flash.

3. **`usePaymentStore`**:
   - Manages preferred payment method (credit card vs easy pay), seeded during checkout.

4. **`useToastStore`**:
   - Manages accessible, non-intrusive toast messages.
   - Portaled to `document.body` via `A11yToastContainer` with dynamic bottom clearance above open Vaul bottom drawers.

---

## Service Layer (`lib/services/`)

A barrel-exported service layer abstracts data access and side-effects:
- **`MenuService`**: Provides category filtering, product retrieval, search filtering, and localized name extraction (`getLocalizedTitle`).
- **`OrderService`**: Simulates order placement with `MOCK_LATENCY_MS` (600ms). Supports deterministic failure testing via `forceFailure: true`.
- **`StoreService`**: Resolves valid store identifiers and table configurations.
- **`A11yFeedbackService`**: Orchestrates accessible fan-out notifications (audio/visual toast + haptic feedback) on user actions.

---

## Hardware & Compatibility Engineering

### iOS 15 / Safari 15 / Low-End Hardware
To ensure accessibility extends to users using older devices (e.g. iPhone 6s):
1. **Polyfill Layer (`lib/polyfills.ts`)**:
   - Loaded unconditionally before any application code in `app/layout.tsx` and `app/providers.tsx`.
   - Polyfills `window.requestIdleCallback`, `window.cancelIdleCallback`, and `Object.hasOwn`.
2. **GPU-Accelerated Menu Tabs (`MenuCategoryHeader.tsx`)**:
   - Uses a single persistent indicator pill moved via CSS `transform: translate3d(x, 0, 0)` and `width` transitions.
   - Caches tab offset coordinates in `tabRectsRef` and section vertical offsets in `sectionOffsetsRef` to eliminate layout thrashing during scroll events.
   - Wraps the category tablist with `[contain:layout]` to isolate reflow boundaries.
