# Features — Phase 1 MVP Screen Flow

This document describes the screen-by-screen flow for the Phase 1 prototype, reflecting the four resolved decisions in `docs/decisions/`. It's concrete enough to build from, but doesn't specify final UI copy.

## Flow overview

```
Entry (QR/NFC scan)
  └─→ Menu browsing ──→ Product detail (bottom sheet) ──→ back to Menu (item added)
        │                                                        │
        │  (cart pill visible throughout, tap to open)           │
        ▼                                                        ▼
      Cart review (bottom sheet) ──→ Order type + checkout ──→ Confirmation
                                                                   │
                                                        ┌──────────┴──────────┐
                                                        view receipt      order again → Menu

Settings (reachable from a persistent icon, on every screen above, never gating)
```

There is no disability-select gate and no mandatory pre-order step beyond arriving via a valid link (`docs/decisions/0001-onboarding-model.md`).

## 1. Entry

- Route: `/order/[storeId]?table={n}`, per `docs/architecture.md`. The QR/NFC code encodes this URL directly.
- Renders usable content immediately — no splash screen, no "loading your accessible experience" theater, no install prompt of any kind.
- If `storeId`/`table` are missing or invalid (e.g., someone opened the app directly instead of scanning a code), fall back to a manual store/table entry bottom sheet rather than a hard error — kept as a fallback convenience from legacy's `ManualTableSelectorModal` concept, useful for QA too.
- The persistent settings-icon affordance (top corner, 44px+ target) is present from this screen onward, everywhere.

## 2. Menu browsing (core screen)

- 3–4 categories max, per `docs/decisions/0002-menu-domain.md`'s fictional cafe menu (coffee / beverages / desserts / light food) — stays within the design spec's cognitive-load guidance of keeping choices per screen limited.
- Category switcher at the top; product grid below, one column or a loose two-column grid depending on real device testing (mobile-only, ~360–430px band per `docs/architecture.md`).
- Each product card shows name, price, a short description, and a real (non-decorative) `alt` on its image — no information conveyed by image alone.
- Tapping a card opens a bottom-sheet product detail: full description, option groups where relevant (temperature, size, milk substitution), a quantity stepper, and 담기 (Add to cart) as the primary 56px bottom CTA (`docs/design-system.md` spacing scale).
- A small cart-status pill (item count + running total) is visible throughout browsing — not a full tab, just a persistent, tappable summary (`docs/decisions/0003-navigation-paradigm.md`).
- **States**: empty category (rare, given a small fixed menu, but still needs a real empty state, not a blank area); a product temporarily unavailable shows unavailability via color *and* text *and* icon together, never color alone (design spec rule 4 equivalent — never convey state by color only).

## 3. Cart review

- Opens as a bottom sheet from the cart-status pill — not a route change, stays anchored to where the user was.
- Line items with quantity adjust (+/-) and remove; every removal is undoable via a toast with an "실행 취소" (Undo) action, following legacy's toast+undo history pattern (`docs/architecture.md`).
- Running total clearly visible, updates live as quantities change.
- 다음 (Next) is the primary bottom CTA, 56px.
- **States**: empty cart (if reached directly somehow) shows a clear "장바구니가 비어 있어요" state with a direct way back to the menu, not a dead end.

## 4. Order type + checkout

- Simple binary choice first: dine-in (매장) vs. takeout (포장) — kept minimal, one decision at a time per the single-focus wizard pattern.
- Then a **mocked** payment step. No real PG/Stripe integration in Phase 1 (`docs/decisions/0004-voice-scope.md`'s sibling scope note in `plan.md` — real payment is explicitly out of scope for this round). The screen still needs to feel complete: a plausible payment-method selector UI, order summary, total.
- 결제하기 (Pay) is the single highest-emphasis CTA on the whole flow — 64px, the one screen that uses the max-emphasis touch target size from `docs/design-system.md`.
- **States**: mocked processing state after tapping 결제하기 (brief, Framer Motion–driven per `docs/tech-stack.md`, collapses to an instant state change when `reduceMotion` is on) before moving to confirmation. No countdown, no artificial time pressure at any point in this screen.

## 5. Confirmation

- Large, legible order number as the focal point.
- No countdown, no "please wait, queue clears in..." timer — confirmed absent per `docs/design-system.md`'s motion rules.
- Actions: view receipt, order again (returns to Menu with a fresh cart), and nothing else competing for attention.
- Legacy's `canvas-confetti` success effect is fine to keep as an optional delight layer — gated behind `reduceMotion`, falling back to a static success checkmark card when that setting is on (`docs/design-system.md` motion rules).

## 6. Settings (reachable anytime, never gating)

Opened via the persistent settings icon present on every screen above. Not a route the user is ever forced into.

- High-contrast / AAA toggle (switches instantly per `docs/design-system.md`)
- Font scale, with a live preview of the change as it's adjusted
- Reduced motion override (independent of, but seeded from, the OS-level `prefers-reduced-motion`)
- Haptics on/off
- Dyslexia-friendly spacing toggle (opt-in letter/line/word spacing from `docs/design-system.md`)
- Language

One-tap convenience presets (e.g., a single toggle that bundles several settings for low-vision use) are a reasonable future addition inside this screen — conceptually similar to legacy's `AccessibilityService` preset-merging idea — but not required for the initial Phase 1 build.

## Cross-cutting, not a screen

- **Native screen reader support** (VoiceOver / TalkBack) via correct semantic HTML and ARIA applies to every screen above, from the start — this is an engineering requirement threaded through all of the above, not a feature with its own screen (`docs/decisions/0004-voice-scope.md`).
- **"Call staff for help"** — a small, persistent escape hatch (not a full screen, more like a floating action) worth carrying forward from legacy: cheap to build, directly on-mission for a barrier-free product, and a reasonable safety net for any situation the self-order flow doesn't handle well.
