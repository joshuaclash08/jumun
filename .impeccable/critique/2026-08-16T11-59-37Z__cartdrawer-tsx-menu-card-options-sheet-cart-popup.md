---
target: menu card / product options sheet / cart popup ordering flow
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-16T11-59-37Z
slug: cartdrawer-tsx-menu-card-options-sheet-cart-popup
---
Method: dual-agent (A: aa2233381a77431f8 · B: a78df90f69c2812e7)

⚠️ Note on volatility: another active session on this machine (peer session, not this one) was concurrently editing `ProductCard.tsx`, `FeaturedMenuSection.tsx`, and `ProductDetailSheet.tsx` while this review was running — observed 3 distinct content states for `ProductCard.tsx` across ~10 minutes. This report is pinned to the state read immediately before writing it up. `CartDrawer.tsx`, `CartSummaryPill.tsx`, and `store/useCartStore.ts` were untouched throughout and are stable.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Add-to-cart and explicit-delete both toast; decrementing a stepper to 0 removes the item with zero feedback |
| 2 | Match System / Real World | 4/4 | Natural Korean copy, tabular pricing convention throughout |
| 3 | User Control and Freedom | 3/4 | Undo exists for explicit delete, not for stepper-to-zero — same outcome, asymmetric recovery |
| 4 | Consistency and Standards | 2/4 | Menu card has zero boundary cues (no border, no shadow); cart line-item card has both; two different "remove item" behaviors for the same outcome |
| 5 | Error Prevention | 4/4 | Required option groups pre-select a default; quantity floor of 1 inside the sheet |
| 6 | Recognition Rather Than Recall | 4/4 | Live running total as options/qty change; cart cards persist full option summary text |
| 7 | Flexibility and Efficiency | 3/4 | No repeat-add/favorites — thin, but acceptable for stated Phase 1 scope |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean overall; menu-card boundary is currently near-invisible tint-on-white |
| 9 | Error Recovery | 3/4 | Good toast+undo where present; stepper path has none; sold-out state has zero data coverage (0/19 products) |
| 10 | Help and Documentation | 3/4 | Minimal-help is fine for this task size; "필수" badge risks reading as a filter chip to a first-timer |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

The accessibility layer is genuinely authored for Jumun, not generic: the compressed VoiceOver labels on `ProductCard` (`"{name}, {price}원[, 품절된 상품입니다]"`), the `sr-only` option-group announcements, the `aria-live` quantity spans, and the full undo-on-delete toast in `useCartStore.ts` all show real thought about this product's specific mission. The `RollingPrice` odometer component is also a distinctive, well-built piece of polish (properly `aria-hidden` on the visual digits with a clean `aria-label` fallback).

Where it reads as less specific right now: the menu-card visual layer is mid-migration from the documented flat-illustration system to real photography (`next/image` + `product.imageUrl`), which is presently a live, unreviewed change against a doc (`DESIGN.md`) that still explicitly bans it. Until that's resolved one way or the other, the surface is caught between two visual identities.

**Deterministic scan**: `detect.mjs --json` on the six target files (`ProductCard.tsx`, `ProductDetailSheet.tsx`, `CartDrawer.tsx`, `CartSummaryPill.tsx`, `card.tsx`, `button.tsx`) returned 0 findings, exit 0. Sanity-checked against the parent directories, which did surface real (out-of-scope) findings elsewhere — e.g. `LandingClientView.tsx:53` and `MenuClientView.tsx:182` use font sizes off the DESIGN.md type ramp — confirming the detector is live, not silently no-op'ing. No false positives to report on the target files since none fired.

## Overall Impression

The interaction logic is careful and mostly well-built — option selection, live pricing, undo-on-delete, reduced-motion handling are all done with real attention. The gap is in a handful of specific, fixable spots: one silent data-loss path (stepper-to-zero), one live dark-mode bug that contradicts the product's own "no dark mode" decision, and a visual identity question (photography vs. illustration) that's currently unresolved in the code even though the docs have a clear answer.

## What's Working

- **`store/useCartStore.ts:60-70`** — `removeItem`'s undo pattern (toast + `onUndo` callback that restores the exact item) is a well-executed, non-generic safety net — confirmed live: deleting an item shows a toast, and the cart correctly returns to empty/populated state.
- **`components/ui/RollingPrice.tsx`** — the digit-column odometer animation is genuinely delightful *and* accessible: visual digits are `aria-hidden`, a clean `sr-only` label carries the real value, and it collapses to instant under `reduceMotion`. This is the kind of detail that makes a flow feel crafted rather than templated.
- **`components/flow/ProductDetailSheet.tsx:181-188`** — the live "주문 금액" total that updates with every option/quantity change removes any surprise before the user commits to adding the item.

## Priority Issues

**[P0] Stepper-to-zero silently deletes a cart item with no feedback, no undo, no announcement**
`store/useCartStore.ts`'s `updateQuantity` filters an item out entirely once quantity hits 0 — no `notify()` call, no undo, nothing `aria-live`. Confirmed live: opening the cart drawer with one item, tapping the quantity stepper's minus button down to 0 makes the item vanish and the drawer silently flips to its empty state. Compare that to the explicit 삭제 (delete) button in `CartDrawer.tsx:104-113`, which routes through `removeItem` and gets a full toast + undo. Same end result, two different feedback contracts — and the stepper is the path a user is more likely to reach for casually. For a screen-reader user this is worse: they hear "현재 수량 0개" and then nothing else — no confirmation the line item is gone.
**Fix**: route stepper-to-zero through the same `removeItem` path (toast + undo), or give `updateQuantity` its own undo-capable notification when it results in a removal.
**Suggested command**: `/impeccable harden`

**[P1] `dark:` classes will silently activate for any visitor with system dark mode on — but this product has explicitly decided it has no dark mode**
`app/globals.css:5-6` states outright: *"Jumun has no light/dark distinction — it has a default theme and an opt-in AAA/high-contrast mode"* and defines no `dark` custom-variant override. That means Tailwind's `dark:` utility falls back to its default `prefers-color-scheme: dark` media query. `ProductCard.tsx:36` and `FeaturedMenuSection.tsx:42` (current state) both ship `dark:bg-[#1E232B] dark:hover:bg-[#252C36]` — colors that were never designed, reviewed, or contrast-checked as part of this system. Any visitor whose phone is set to dark mode gets a menu grid with near-black card tiles sitting inside an otherwise all-white, hardcoded-light app — a jarring, half-themed result nobody decided on.
**Fix**: strip the `dark:` variants from these two files (or, if dark mode is actually being planned, that's a real scope decision that needs to go through `DESIGN.md`, not land ad hoc in two components).
**Suggested command**: `/impeccable audit`

**[P1] Menu card has zero boundary cues; cart line-item card has both — and the photography-vs-illustration question is live and unresolved**
Current `ProductCard.tsx` (no `border`, no `shadow`, distinguished from the page only by a `bg-[#F4F6F8]` tint that reads as barely-there against `#FFFFFF`) directly contradicts `DESIGN.md`'s own **Border-and-Shadow Rule**, which explicitly says the *prior* "Never-Alone color-shift" approach (tint-only, no border/shadow) was deliberately superseded — "Toss cards are white-on-white — the boundary reads via a 1px border AND a shadow together, not a background color-shift." Meanwhile `CartDrawer.tsx`'s line-item cards (untouched, stable) use the full `shadow-resting border-border` treatment from `components/ui/card.tsx`. Two card types in the same three-step flow, two different boundary languages. Separately: `ProductCard.tsx`, `FeaturedMenuSection.tsx`, and `ProductDetailSheet.tsx` currently all render real photography (`next/image` + `product.imageUrl`, 19 files under `public/images/menu/`), while `DESIGN.md`'s Do's and Don'ts still reads *"Don't use real food photography or attempt photorealistic generated food images... flat illustration only"* and `docs/component-standards.md` documents `TossIllustrations.tsx` as the card imagery source. This looks like a genuine in-progress pivot rather than a finished decision (the files were still changing during this review) — worth resolving explicitly (update `DESIGN.md` either way) before more surfaces migrate.
**Fix**: decide photography vs. illustration once, update `DESIGN.md` to match, then bring the menu card's boundary treatment (border+shadow) in line with the cart card's.
**Suggested command**: `/impeccable document` (to reconcile DESIGN.md with reality), then `/impeccable layout` for the card boundary fix

**[P2] 품절 (sold-out) badge is color+text only — no icon — and has zero data coverage**
`ProductCard.tsx` renders the sold-out state as a black pill with white "품절" text plus a grayscale filter. `DESIGN.md`'s own Do's list requires unavailable/error/success states to be legible through **color and text and icon together, never color alone** — every other status surface in this app (toasts) follows that; this badge doesn't. It's also currently untestable in practice: 0 of the 19 products in `lib/data/menu.json` have `"available": false`, so this state has never actually been seen rendered or QA'd.
**Fix**: add a small icon (e.g. a slash/ban glyph) to the badge; seed at least one sold-out product in the menu data so the state gets exercised.
**Suggested command**: `/impeccable harden`

**[P2] Two circular touch targets share the bottom thumb-zone with only 8px between them**
The staff-call bell (`fixed bottom-4 left-4`, 64×64px) and the cart summary pill (`left-22`, i.e. positioned to start exactly 8px after the bell ends) sit in the same row at the bottom of the screen — confirmed via `getBoundingClientRect()`: bell spans x16–80, pill starts at x88. They don't overlap, but for a product whose stated audience explicitly includes mobility-impaired and elderly users, an 8px gap between two adjacent 44px+ circular/pill targets in the primary one-thumb reach zone is tight — a slightly imprecise tap could catch the wrong one.
**Fix**: widen the gap (16px+) or stagger them vertically instead of packing them into one horizontal row.
**Suggested command**: `/impeccable adapt`

## Persona Red Flags

**Sam (screen-reader / accessibility-dependent user)**: the stepper-to-zero silent deletion (P0) is the clearest failure for this persona specifically — no announcement that an item left the cart, no way to know whether it was one line or the whole order that just disappeared. This directly undercuts the product's core promise ("full native screen-reader support... a first-class design requirement").

**Casey (distracted mobile user)**: the tight 8px gap between the staff-call button and the cart pill (P2) is exactly the kind of thing that trips up a one-handed, half-attentive tap. And a visitor with dark mode on (P1) gets a visually broken-looking menu grid with no idea why — likely to read as "this app is buggy," not "this is unfinished."

**Riley (stress tester)**: rapidly tapping the stepper's minus button on a qty-1 cart item deletes the line with zero friction, zero confirmation, and no visible recovery path — unlike the explicit delete button two inches away in the same drawer, which has both.

## Minor Observations

- `components/ui/RollingPrice.tsx:73-81` sets `aria-label` on the wrapping span *and* includes a same-text `sr-only` child span — redundant (the `aria-label` wins accessible-name computation; the child is inert for assistive tech, harmless but worth trimming).
- The "필수" required-option badge (`bg-primary/10 text-primary`) visually echoes the category scrollspy's selected-pill styling closely enough that a first-timer could misread it as an interactive filter chip rather than a static requirement label.
- On a product with 2+ required option groups, Toss Blue currently appears in 4+ places on one screen at once (each group's "필수" badge + the selected option per group + the CTA) — worth rechecking against the system's own One Accent Rule once the current photography/illustration question settles.

## Questions to Consider

1. Is the photography migration (`ProductCard`/`FeaturedMenuSection`/`ProductDetailSheet` now rendering real photos) an intentional pivot away from the documented flat-illustration system, or an in-progress experiment that shouldn't ship as-is?
2. If decrementing a stepper to 0 and tapping 삭제 both end in "item gone," should they have different feedback contracts — or was the silence on the stepper path an accidental gap rather than a deliberate "don't interrupt for a routine adjustment" choice?
3. Given the product's stated no-dark-mode decision, should `dark:` variants be actively lint-guarded against, so an ad hoc one doesn't slip into a future component again?
