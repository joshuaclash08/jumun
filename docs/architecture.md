# Architecture

This document describes the folder structure, core patterns, and platform policies for Jumun's Phase 1 app. Foundation scaffolding (dependencies, shadcn init, this folder skeleton, app shell) is in progress per `plan.md`'s current status; screens and business logic are not built yet.

## Folder structure

```
/app
  layout.tsx              # <html lang="ko">, next/font (Pretendard + Noto Sans KR), theme/a11y sync provider
  page.tsx                 # root fallback — no encoded storeId/table (direct visit, home-screen relaunch, or QR/NFC
                           # read failure); renders straight into the manual store/table entry bottom sheet
  /order/[storeId]/         # the real entry point — every QR/NFC tag encodes this route, e.g. /order/{storeId}?table={n}
  /settings/                 # dedicated settings route, not a sheet — see docs/decisions/0007-settings-as-dedicated-route.md
    page.tsx                  # 테마/화면, 접근성 + 결제 (linking out), 언어
    /accessibility/page.tsx    # dyslexia spacing, haptics, alert display-time
    /payment/page.tsx           # mocked default payment method (no real card/account data)
  globals.css                # @import "tailwindcss" + @theme tokens sourced from docs/design-system.md
/components
  /ui                        # shadcn-generated primitives ONLY — never hand-edited beyond shadcn's own codegen
  /a11y                       # skip-link, visually-hidden text helper, live-region announcer
  /layout                      # HeaderBar (store name/table, staff-call + settings-link icons)
  /flow                         # one component per wizard screen (menu, cart, checkout, confirmation, staff call, QR scan)
  /settings                      # SettingsHeader (back+title), SettingsRow/SettingsGroup (list-row primitives)
/hooks                          # hardware-interface wrappers — see pattern below
  useHaptics.ts
  useReducedMotion.ts
  useLenisMotionSync.ts
/store
  useCartStore.ts                # cart state, toast+undo history
  useAccessibilityStore.ts        # settings only, never a raw disability profile
  usePaymentStore.ts               # which mocked payment method (card/easy-pay) checkout preselects
/lib
  /services                       # MenuService, OrderService, StoreService, AccessibilityService, A11yFeedbackService
  /data                            # menu.json + stores.json — fictional cafe seed data (docs/decisions/0002-menu-domain.md),
                                   # not hardcoded TS; services read these, never edit them by hand mid-request
  /types                            # Product, CartItem, StoreInfo, StoreListing, OrderStatus, OrderReceipt, etc.
  utils.ts                          # shadcn's cn() helper
/public
  manifest.json                     # installable PWA metadata — never a required install gate
components.json                     # shadcn CLI config
```

Compared to legacy's `components/{a11y,kiosk,layout,steps,ui}` split, this collapses `kiosk/` and `steps/` into a single `flow/` — legacy split them because it had two parallel systems (a disability-gated onboarding wizard in `steps/`, and the main ordering UI in `kiosk/`). With the onboarding gate removed (`docs/decisions/0001-onboarding-model.md`), there's no reason to keep two parallel directories; it's one flow.

### PWA manifest

`public/manifest.json` makes the app installable for anyone who chooses to (never a requirement — see `PRODUCT.md`'s positioning), and supplies the browser-chrome theming for anyone who doesn't install. Required fields: `name` ("Jumun — 바리어프리 셀프오더"), `short_name` ("Jumun"), `start_url: "/"` (deliberately the root fallback route above, not a specific `/order/[storeId]`, since a stale store/table context baked into a home-screen icon would be wrong the next time it's tapped at a different venue), `display: "standalone"`, `background_color`/`theme_color` set to `--color-bg` (`#FFFFFF`, `docs/design-system.md`) so the OS splash/chrome matches the app instead of defaulting to white, and an icon set (192px/512px minimum, plus a maskable variant for Android's adaptive-icon treatment). No app-install banner or prompt is ever shown proactively — this stays purely opt-in, consistent with `docs/decisions/0001-onboarding-model.md`'s no-gate principle extending to installation, not just onboarding.

## Patterns worth keeping from legacy

Legacy got a few structural things right even where its product decisions were inconsistent. These patterns are worth reusing conceptually — not copy-pasting the code, since legacy never had shadcn/Radix wired in and its actual component implementations predate this project's design system.

### Service layer (`lib/services/`)

A barrel-exported set of services (`MenuService`, `OrderService`, `StoreService`, `AccessibilityService`, `A11yFeedbackService`) sits between components/stores and data. `OrderService.submitOrder` returns a mocked `Promise` with artificial latency in Phase 1 — no real backend yet (see `plan.md`'s Phase 1 scope) — which keeps the calling code shaped the way it'll need to be once a real API exists.

`A11yFeedbackService` is a specific pattern worth keeping verbatim: every cart mutation (add/remove/quantity change) fires a fan-out to toast + haptic + visual-caption feedback, and it's dynamically `import()`-ed from inside the store action rather than imported at the top of the file. That's not incidental — it's how legacy avoided a circular import between the cart store and the accessibility feedback system. Keep the technique, not just the idea.

### Hooks as hardware-interface wrappers

Every hook that touches something platform-specific — `useHaptics`, `useReducedMotion` — wraps the actual browser API behind a small, stable interface:

```ts
// Phase 1 (web): navigator.vibrate() + a visual pulse fallback
// Phase 2 (native, later): swap the implementation for expo-haptics
// Call sites never change — only what's inside the hook does
```

This is deliberate, not incidental — `plan.md`'s Phase 2 (Expo/React Native port) only works cleanly if hardware access is centralized behind interfaces now. The alternative — calling `navigator.vibrate()` directly wherever haptic feedback is needed — would mean every call site needs rewriting at the Phase 2 boundary instead of just the hook internals.

`useLenisMotionSync.ts` is new (not in legacy) — see `docs/tech-stack.md`'s Lenis caveat: it gates `<ReactLenis>` behind the app's own `reduceMotion` store value rather than relying on Lenis's built-in OS-level check alone.

### State shape

Two Zustand stores, following legacy's shape:

- **`useCartStore`** — `storeInfo` (`{id, name, table}`, parsed from the `/order/[storeId]?table=` URL), `items[]`, order status, last receipt, a toast queue with undo callbacks, and a capped undo history stack (legacy capped at 5 — a reasonable starting point). Every mutation pushes to the undo stack first, then triggers `A11yFeedbackService` as described above.
- **`useAccessibilityStore`** — language, high-contrast/AAA flag, font scale, reduced-motion override, haptics on/off, dyslexia-mode spacing, timeout-extension (kept as a settings concept even though Phase 1 has no timeouts to extend — see below). Persists via cookie/localStorage only, and only the merged boolean/numeric settings — **never** a raw disability category or profile. This is a privacy-conscious pattern worth keeping exactly: legacy already made the right call here.

**Difference from legacy worth calling out explicitly**: legacy branched storage between cookies (personal phone) and `sessionStorage` (detected shared/kiosk device via `?table=`/`?store=` URL params), anticipating that a physical kiosk might also exist alongside BYOD phones. This project confirmed there is no shared-kiosk hardware case at all — every session is BYOD. So Jumun's settings storage is simply cookie/localStorage, unconditionally. No device-type branch needed.

## Data model

Core types (`lib/types/`), adapted conceptually from legacy's shapes but re-scoped to the fictional cafe menu (`docs/decisions/0002-menu-domain.md`):

```ts
// lib/types/menu.ts
interface ProductOption {
  id: string;
  labelKo: string;
  priceDelta: number; // 0 for no-cost options (e.g. temperature); positive for upsizes
}

interface ProductOptionGroup {
  id: string;
  labelKo: string;
  required: boolean;
  selectionType: 'single' | 'multiple';
  options: ProductOption[];
}

interface Product {
  id: string;
  category: 'coffee' | 'beverage' | 'dessert' | 'food';
  nameKo: string;
  descriptionKo: string;
  voiceDescriptionKo: string; // fuller sentence for screen-reader labels, see docs/design-system.md
  price: number; // KRW, base price before options
  icon: string; // lucide-react export name, one per product -- components/flow/ProductCard.tsx
  optionGroups: ProductOptionGroup[];
  available: boolean;
}

// lib/types/cart.ts
interface CartItemSelection {
  groupId: string;
  optionIds: string[];
}

interface CartItem {
  id: string; // unique per line item, not per product -- same product with different options is a separate line
  productId: string;
  quantity: number;
  selections: CartItemSelection[];
  unitPrice: number; // base price + selected option deltas, snapshotted at add-time
}

// lib/types/store.ts
interface StoreListing {
  storeId: string;
  storeName: string;
  branchKo: string;
  addressKo: string;
  defaultTable: string;
  distanceKo: string;
}

// lib/types/order.ts
interface StoreInfo {
  storeId: string;
  storeName: string;
  table: string;
}

type OrderType = 'dine-in' | 'takeout';
type OrderStatus = 'idle' | 'submitting' | 'failed' | 'confirmed';

interface OrderReceipt {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  orderType: OrderType;
  store: StoreInfo;
  placedAt: string; // ISO timestamp
}

// lib/types/accessibility.ts
interface AccessibilitySettings {
  language: 'ko' | 'en';
  highContrast: boolean; // false = default theme, true = AAA mode (docs/design-system.md)
  fontScale: number; // multiplier on the 18px base, not a replacement unit
  reducedMotion: boolean; // seeded from prefers-reduced-motion, independently overridable
  dyslexiaSpacing: boolean;
  hapticsEnabled: boolean;
}
```

## Service layer contracts

`lib/services/` function signatures (all return `Promise`s, even where Phase 1's implementation is synchronous/mocked — keeps call sites correct once a real backend lands):

```ts
// MenuService
getCategories(): Promise<{ id: string; labelKo: string }[]>
getProductsByCategory(categoryId: string): Promise<Product[]>
getProduct(productId: string): Promise<Product | null>

// OrderService
submitOrder(storeInfo: StoreInfo, items: CartItem[], orderType: OrderType): Promise<OrderReceipt>
// Phase 1: mocked latency + a deliberately reachable simulated-failure path
// (docs/features.md's "Order submission fails" state) -- not just an always-succeeds stub

// StoreService
resolveStore(storeId: string, table: string): Promise<StoreInfo | null>
// null triggers the invalid/expired-link state in docs/features.md, not a thrown error

// AccessibilityService
getSettings(): AccessibilitySettings // reads the persisted, cross-venue store
mergeSettings(partial: Partial<AccessibilitySettings>): AccessibilitySettings

// A11yFeedbackService
announce(messageKo: string, priority: 'polite' | 'assertive'): void // drives the live-region text
notify(kind: 'success' | 'error', messageKo: string): void // toast + haptic + visual-caption fan-out
```

`StoreService.resolveStore` returning `null` rather than throwing is deliberate: an invalid/expired link is an expected, designed-for outcome (`docs/features.md`), not an exceptional one — reserve thrown errors for genuinely unexpected failures.

## Mobile-only viewport policy

"Mobile-only" means fluid layout within the real phone-width band — roughly 360–430px — not one fixed pixel size. Legacy built a `MobileDeviceContainer` component that letterboxes the app to a fixed 430px-wide centered column with white space on either side when viewed on a wide/desktop screen. That's explicitly not needed here: this project spends zero effort on tablet/desktop presentation, including the cosmetic effort of a desktop preview frame. Build fluid mobile-width layouts with a normal responsive viewport meta tag; nothing scales up to larger breakpoints. Trivial to reintroduce a preview container later if a desktop demo affordance is ever wanted — not worth building now.

**Safe-area insets are not optional.** The viewport meta tag needs `viewport-fit=cover` (Next.js: set `viewportFit: 'cover'` in the `viewport` export alongside `width`/`initialScale`, omitting `maximumScale`/`userScalable` per the fix below) — without it, every `env(safe-area-inset-*)` value silently resolves to `0` and the fixed bottom bar (`docs/design-system.md`) sits flush against the home indicator on notched devices, invisible in a desktop browser's device toolbar and wrong only on a real phone. The bottom bar's padding is the baseline gap *plus* `env(safe-area-inset-bottom)`, not one or the other.

## Cross-venue accessibility persistence

`useAccessibilityStore` persists under a single global key (not scoped per store/table) — confirmed intentional in `PRODUCT.md`: a user's settings follow them to every venue they scan a Jumun tag at, not just the one they set them at. Only `useCartStore`'s `storeInfo` (and the cart contents themselves) are scoped to the current session/URL — those two stores have deliberately different persistence scopes for this reason, not by oversight.

## Two fixes versus legacy — deliberately not inherited

1. **Pinch-zoom must stay enabled.** Legacy's `app/layout.tsx` set:
   ```ts
   export const viewport: Viewport = {
     width: 'device-width',
     initialScale: 1,
     maximumScale: 1,
     userScalable: false,
   };
   ```
   `maximumScale: 1` and `userScalable: false` disable pinch-to-zoom — a direct accessibility regression (WCAG 1.4.4, Resize Text) for exactly the low-vision users this product targets. Jumun's viewport config omits both.

2. **TypeScript build errors must not be silenced.** Legacy's `next.config.ts` set `typescript: { ignoreBuildErrors: true }`, which undermines the strict-mode guarantee claimed elsewhere in its own docs. Jumun keeps the default (errors fail the build).
