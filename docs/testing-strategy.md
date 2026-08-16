# Testing Strategy

What gets tested, how, and why — scoped to what Phase 1 actually needs. This isn't an aspiration to maximize coverage; it's the minimum that keeps an accessibility-first product honest as it grows past what one person can manually re-check on every change.

## Unit tests — Vitest

Matches legacy's own precedent (`legacy-reference/tests/unit/*.test.ts(x)`, run via `vitest run`). Scope:

- **`store/useCartStore.ts`**: quantity math, the undo history stack (push/pop, cap behavior), total calculation with option-price deltas, and that every mutation actually calls into `A11yFeedbackService` (mocked in these tests, not exercised for real).
- **`store/useAccessibilityStore.ts`**: settings merge logic, persistence read/write (mocked storage), and specifically that `reducedMotion`/`highContrast`/etc. round-trip correctly — a regression here silently breaks accessibility for every returning user, not just a visual nit.
- **`lib/services/*`**: `OrderService.submitOrder`'s mocked success *and* failure paths (`docs/features.md`'s order-failure state needs a real test proving the failure path is reachable, not just present in the UI copy); `StoreService.resolveStore` returning `null` on an invalid store/table rather than throwing (`docs/architecture.md`'s deliberate convention).

Pure logic, no rendering — these should run in milliseconds and form the bulk of the suite.

## Component tests — Vitest + React Testing Library

Query by role and accessible name, not by test-id or CSS class — a test that only passes because of a `data-testid` proves nothing about whether a screen reader user could actually find the element. Priority components:

- **Product card / Product detail sheet** (`tests/unit/components.test.tsx`): Option selection updates the price shown, `담기` adds the right line item (right product, right options, right quantity), `maxSelections` limit is enforced with toast notification.
- **Cart sheet & Confirmation** (`tests/unit/components.test.tsx`): Quantity controls, remove-with-undo, itemized receipt details, hero order number display.
- **Navigation & Staff Call** (`tests/unit/components.test.tsx`): `HeaderBar` back button, `OrderTypeSelectView` & `TableSelectView` navigation, `StaffCallButton` two-step drawer flow (idle confirm $\to$ animated checkmark success state).
- **Settings pages & Checkbox system** (`tests/unit/settings.test.tsx`): Checkbox primitive toggle, text-only settings rows, auto-save feedback, default payment method selection, full axe accessibility audit with zero violations.
- **Bottom action bar**: Always renders the current screen's single primary action at the documented 56/64px height with progressive blur background masks.

## Automated accessibility checks — axe-core

Run `@axe-core/react` (or `vitest-axe`) against rendered component trees in the component-test suite above, not as a separate manual step — catches missing labels, contrast violations, and invalid ARIA mechanically, on every change, rather than relying on someone remembering to check. This catches *mechanical* violations only; it cannot verify that a screen-reader announcement actually makes sense in context (see Manual QA below) or that focus order matches visual order end-to-end.

Treat an axe violation as a build-breaking failure, not a warning — consistent with `docs/architecture.md`'s decision not to inherit legacy's `ignoreBuildErrors: true` pattern; the same standard applies to accessibility violations as to type errors.

## Manual QA — real assistive technology, on real devices

Automated checks cannot verify the actual experience of using a screen reader. Before any Phase 1 screen ships:

- **VoiceOver (iOS Safari)** and **TalkBack (Android Chrome)**, on real devices, not just simulators where avoidable — swipe-navigate the entire flow for that screen without looking at it, confirm every announcement is a complete, sensible sentence (matching `docs/design-system.md`'s screen-reader content-authoring section), and confirm focus order matches visual order.
- **Keyboard-only navigation** (relevant even on a touch-primary product — switch-control and some motor-impaired users navigate this way): tab through the whole screen, confirm the focus ring (`docs/design-system.md`) is visible at every stop and nothing is reachable-but-invisible or visible-but-unreachable.
- **Reduced-motion on**: confirm every animation actually collapses per `docs/design-system.md`'s motion rules — this regresses silently, since the default (motion on) is what most manual testing happens in.
- Kept from legacy's own explicit guidance, still correct: don't assert specific numeric performance/timing claims from manual QA — screen-reader speed and behavior vary meaningfully by device and OS version. Manual QA confirms correctness (does it announce the right thing, in the right order), not benchmarks a specific device happened to produce.

## Deliberately out of scope for Phase 1

- **Visual regression testing** (Chromatic, Percy, etc.) — worth adding once the component set stabilizes past initial foundation work; premature while screens are still being actively designed.
- **End-to-end browser tests** (Playwright) against a full user journey — there's no real backend yet for an E2E run to meaningfully exercise beyond what the component tests above already cover with mocks; revisit once Phase 2's real API work begins.
- **Load/performance testing** — not meaningful before real traffic patterns exist.

## Where tests live

`tests/unit/` for store/service logic, colocated `*.test.tsx` next to component files for component tests — mirrors legacy's convention where it was already reasonable, per `docs/architecture.md`'s general approach of keeping what worked and fixing what didn't.
