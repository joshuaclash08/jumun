# Features — Phase 1 MVP Screen Flow

This document describes the screen-by-screen flow for the Phase 1 prototype, reflecting the four resolved decisions in `docs/decisions/`. It's concrete enough to build from, but doesn't specify final UI copy.

## Flow overview

```
Entry (QR/NFC scan, table already known)
  │
  │  Entry (manual "직접 매장 선택하기"): order-type choice ──→ dine-in only: table picker
  │                                    └─→ takeout: skip straight to menu ──┘
  ▼
Menu browsing ──→ Product detail (bottom sheet) ──→ back to Menu (item added)
        │                                                        │
        │  (cart pill visible throughout, tap to open)           │
        ▼                                                        ▼
      Cart review (bottom sheet) ──→ Checkout (dine-in/takeout shown read-only) ──→ Confirmation
                                                                   │
                                                        ┌──────────┴──────────┐
                                                        view receipt      order again → Menu

Settings (reachable from a persistent icon, on every screen above, never gating)
```

There is no disability-select gate and no mandatory pre-order step beyond arriving via a valid link (`docs/decisions/0001-onboarding-model.md`).

## 1. Entry

- QR/NFC route: `/order/[storeId]?table={n}`, per `docs/architecture.md`. The physical tag at the table carries both a QR code and an NFC chip encoding this same URL — scanning or tapping either lands here identically (`PRODUCT.md`), skipping straight to menu browsing below.
- Manual entry route (home screen's "직접 매장 선택하기" list, for visitors who didn't scan a tag): `/order/[storeId]` with no query params. This resolves `storeId` but not table/order-type yet, so it renders a dine-in-vs-takeout choice (`components/flow/OrderTypeSelectView.tsx`) instead of the menu. Choosing 포장 (takeout) resolves the menu immediately (`?type=takeout`, no table involved); choosing 매장 식사 (dine-in) goes to a dedicated table-number screen, `/order/[storeId]/table` (`components/flow/TableSelectView.tsx`), which then resolves the same `?table={n}` URL the QR/NFC path uses. See `docs/decisions/0014-entry-order-type-and-table-selection.md`.
- Renders usable content immediately — no splash screen, no "loading your accessible experience" theater, no install prompt of any kind.
- On arrival, accessibility settings from `useAccessibilityStore` apply immediately if this device has used Jumun before, at *any* venue — contrast mode, font scale, reduced motion, language, and haptics all carry over automatically (`PRODUCT.md`'s Operating Context; `docs/architecture.md`'s state shape). Only the store/table/order-type context is new each visit; personalization is never re-entered.
- If `storeId` itself is missing or invalid (e.g., a mistyped or expired link), show the invalid-link empty state (`components/flow/InvalidOrderLinkNotice.tsx`) rather than a hard error — offers a working sample-store link, useful for QA too.
- The persistent settings-icon affordance (top corner, 44px+ target) is present from this screen onward, everywhere.
- **Motion**: content fades/settles in on first paint (Motion, ~200ms) — no loading-bar theater, no logo animation gating interaction. Collapses to an instant appearance when `reduceMotion` is on.

## 2. Menu browsing (core screen)

- 3–4 categories max, per `docs/decisions/0002-menu-domain.md`'s fictional cafe menu (coffee / beverages / desserts / light food) — stays within the design spec's cognitive-load guidance of keeping choices per screen limited.
- Category switcher at the top; product grid below, one column or a loose two-column grid depending on real device testing (mobile-only, ~360–430px band per `docs/architecture.md`).
- Each product card shows name, price, a short description, and a real (non-decorative) `alt` on its image — no information conveyed by image alone.
- Tapping a card opens a bottom-sheet product detail: full description, option groups where relevant (temperature, size, milk substitution), a quantity stepper, and 담기 (Add to cart) as the primary 56px bottom CTA (`docs/design-system.md` spacing scale).
- A small cart-status pill (item count + running total) is visible throughout browsing — not a full tab, just a persistent, tappable summary (`docs/decisions/0003-navigation-paradigm.md`).
- **States**: empty category (rare, given a small fixed menu, but still needs a real empty state per `docs/design-system.md`'s empty-state pattern, not a blank area); a product temporarily unavailable shows unavailability via color *and* text *and* icon together, never color alone (design spec rule 4 equivalent); menu data still loading (first paint only — it's static/bundled in Phase 1, so this is near-instant, but the skeleton pattern from `docs/design-system.md` still applies rather than a spinner, since the grid shape is predictable).
- **Motion**: category switch cross-fades the grid (Motion, ~150ms, no slide — a slide here fights the grid's own scroll axis); product-detail sheet enters via Lenis-independent spring-in from the bottom (Motion's `AnimatePresence` — this is state-driven, not a timeline); cart-pill count updates with a small scale-pulse on change, not a full re-render flash.

## 3. Cart review

- Opens as a bottom sheet from the cart-status pill — not a route change, stays anchored to where the user was.
- Line items with quantity adjust (+/-) and remove; every removal is undoable via a toast with an "실행 취소" (Undo) action, following legacy's toast+undo history pattern (`docs/architecture.md`).
- Running total clearly visible, updates live as quantities change.
- 다음 (Next) is the primary bottom CTA, 56px.
- **States**: empty cart (if reached directly somehow) shows a clear "장바구니가 비어 있어요" state with a direct way back to the menu, not a dead end.
- **Motion**: sheet enters/exits via Motion spring (matches the product-detail sheet's physics — one consistent "sheet" motion signature used everywhere a bottom sheet appears, not a bespoke animation per sheet); removed line items collapse via the `layout` prop rather than jump-cutting, so neighboring items visibly reflow instead of teleporting.

## 4. Order type + checkout

- Dine-in (매장) vs. takeout (포장) is decided during Entry above (`OrderTypeSelectView`), not here — checkout shows it as a read-only summary row (icon + label + table number or "픽업대 수령"), so the visitor isn't asked the same binary choice twice with two chances for it to disagree (`docs/decisions/0014-entry-order-type-and-table-selection.md`).
- Then a **mocked** payment step, still an active choice on this screen. No real PG/Stripe integration in Phase 1 (`plan.md`'s Phase 1 scope — real payment is explicitly out of scope for this round). The screen still needs to feel complete: a plausible payment-method selector UI, order summary, total.
- 결제하기 (Pay) is the single highest-emphasis CTA on the whole flow — 64px, the one screen that uses the max-emphasis touch target size from `docs/design-system.md`.
- **States**: mocked processing state after tapping 결제하기 (brief, Motion–driven, collapses to an instant state change when `reduceMotion` is on) before moving to confirmation. No countdown, no artificial time pressure at any point in this screen. **Mocked failure state**: the mock `OrderService.submitOrder` should be able to simulate a failure path (not just always succeed) so the failure UI actually gets exercised — a clear, specific error ("결제를 완료하지 못했어요"), the cart and selections fully preserved (never silently cleared on failure), and 다시 시도 (Try again) as the primary action. This is a real production affordance, not an edge case to skip because Phase 1 has no real payment backend.
- **Motion**: the processing state is a static, calm indicator (skeleton-style pulse, not a spinner — see `docs/design-system.md`) rather than an urgent-feeling animation, since urgency here would reintroduce the time-pressure feeling the no-countdown rule exists to avoid.

## 5. Confirmation

- Large, legible order number as the focal point.
- No countdown, no "please wait, queue clears in..." timer — confirmed absent per `docs/design-system.md`'s motion rules.
- Receipt (via "영수증 보기"): itemized list with quantities/options/prices, subtotal, total, order number, table/store identity, and timestamp — everything needed to resolve a dispute with staff without re-deriving it from memory.
- Actions: view receipt, order again (returns to Menu with a fresh cart), and nothing else competing for attention.
- Legacy's `canvas-confetti` success effect is fine to keep as an optional delight layer — gated behind `reduceMotion`, falling back to a static success checkmark card when that setting is on (`docs/design-system.md` motion rules).
- **Motion**: a short, choreographed reveal — the receipt content staggers in via Motion's `variants`/`staggerChildren` (not a separate timeline library; `docs/decisions/0009-motion-only-animation.md`), with the success icon getting its own more celebratory spring-pop distinct from the receipt's plainer fade+rise — confetti (`canvas-confetti`) fires alongside as an independent, self-contained particle burst. Still collapses entirely to a static state when `reduceMotion` is on.

## 6. Settings (reachable anytime, never gating)

A dedicated `/settings` route, opened via the persistent settings icon present on every screen above — not a sheet, and not a route the user is ever forced into. See `docs/decisions/0007-settings-as-dedicated-route.md` for why this is a route rather than the sheet pattern the rest of the app uses.

Grouped as a list (icon + label + description, chevron for anything that drills into its own screen — `components/settings/SettingsRow.tsx`):

- **테마 및 화면**: high-contrast/AAA toggle (switches instantly per `docs/design-system.md`), font scale with an inline 3-way picker, reduced motion override (independent of, but seeded from, the OS-level `prefers-reduced-motion`)
- **접근성** (`/settings/accessibility`): dyslexia-friendly spacing toggle, haptics on/off, alert-toast display-time extension
- **결제 수단 관리** (`/settings/payment`): which of the two mocked payment methods (card / easy-pay) `CheckoutSheet` preselects — no real card or account data collected, Phase 1 has no real payment processing
- **언어**: ko/en

One-tap convenience presets (e.g., a single toggle that bundles several settings for low-vision use) are a reasonable future addition inside this screen — conceptually similar to legacy's `AccessibilityService` preset-merging idea — but not required for the initial Phase 1 build.

- **Motion**: each settings screen is a normal route transition (no sheet spring); the font-scale live preview updates the sample text with a simple size interpolation, no bounce or overshoot — a settings control demonstrating its own effect should feel precise, not playful.

## Error and failure states

A production-feeling prototype needs its failure paths actually built, not assumed away because Phase 1 has no real backend:

- **Menu fails to load** (simulated — Phase 1 data is static/bundled, but the UI path should exist for when it isn't): a calm full-screen message with a single 다시 시도 (retry) action — never a raw error string, never a blank screen.
- **Order submission fails** (see Order type + checkout above): cart state is always preserved; the user is never asked to rebuild their order because of a failure that wasn't their fault.
- **Invalid or expired store link** (unknown `storeId`, reachable from `/order/[storeId]` or `/order/[storeId]/table`): distinguished from a network failure — `InvalidOrderLinkNotice` says the link itself is the problem ("주문 링크를 찾지 못했어요") and offers a working sample-store link, not a generic retry that will fail identically every time.
- **Every failure state gets the same accessibility treatment as every success state**: an `aria-live="assertive"` announcement (failures are time-sensitive in a way routine state changes aren't — see `docs/design-system.md`'s screen-reader content section), 4.5:1+ contrast on the error text, and a real, sized touch target on the recovery action — a failure screen is not the place to let quality slip.

## Cross-cutting, not a screen

- **Native screen reader support** (VoiceOver / TalkBack) via correct semantic HTML and ARIA applies to every screen above, from the start — this is an engineering requirement threaded through all of the above, not a feature with its own screen (`docs/decisions/0004-voice-scope.md`).
- **Accessibility settings follow the person, not the venue.** Confirmed in `PRODUCT.md`: settings persist per-device across every Jumun session at every venue. A returning user never re-configures anything — only store/table context changes per scan.
- **"Call staff for help"** — a small, persistent escape hatch (not a full screen, more like a floating action) worth carrying forward from legacy: cheap to build, directly on-mission for a barrier-free product, and a reasonable safety net for any situation the self-order flow doesn't handle well.
