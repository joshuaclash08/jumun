# 0014 — Order type and table selection split into their own entry steps

**Status:** Accepted

## Context

The manual entry path (`components/flow/LandingClientView.tsx`'s "직접 매장 선택하기" store list) picked a store and a table in a single tap, linking straight to `/order/{storeId}?table={store.defaultTable}`. `defaultTable` was never a real table the visitor was sitting at — it was one arbitrary sample number baked into `stores.json`, so every manually-selected order silently landed on the same fixed table regardless of where the visitor actually was, and takeout wasn't reachable from this path at all (checkout's dine-in/takeout toggle existed, but always started from a `storeInfo.table` that had already been resolved to that fake default).

This is a real product gap, not just a UX rough edge: a visitor who taps "직접 매장 선택하기" because they didn't scan a QR/NFC tag has no way to tell the app which table they're actually at, or that they want takeout instead.

The QR/NFC path (`docs/decisions/0006-byod-architecture.md`) is unaffected by this ADR — a physical tag's URL already encodes the correct table for where it's stuck, and stays a single `/order/{storeId}?table={n}` hop.

## Decision

`/order/[storeId]` (no query params) is now itself the "dine-in or takeout" step (`components/flow/OrderTypeSelectView.tsx`), not a dead end requiring a table it doesn't have. Choosing 포장 (takeout) resolves the menu immediately via `/order/{storeId}?type=takeout` — no table involved, matching that a takeout order has no table concept. Choosing 매장 식사 (dine-in) goes to a new dedicated route, `/order/[storeId]/table` (`components/flow/TableSelectView.tsx`), a grid of every table number up to the store's `tableCount` (added to `StoreListing`/`stores.json`, replacing the fictional `defaultTable`); tapping one resolves the same way QR/NFC always has, `/order/{storeId}?table={n}`.

Per `docs/decisions/0007-settings-as-dedicated-route.md`'s established precedent, this is a route rather than a bottom sheet: it's multi-step, worth being back/forward-navigable and deep-linkable (QA and support links benefit from a reproducible `/order/{storeId}/table` URL), and — like settings — isn't secondary content layered over an existing screen the way cart/product-detail/checkout are (`docs/decisions/0003-navigation-paradigm.md`).

`StoreInfo` becomes a discriminated union on `orderType` (`{ orderType: "dine-in"; table: string }` vs `{ orderType: "takeout" }`) instead of an optional `table` field, so a takeout order can no longer type-check with a stale or fabricated table value. `StoreService.resolveStore` takes `orderType` explicitly and only requires `table` for dine-in. Because the order type is now decided before the menu ever renders, `CheckoutSheet`'s dine-in/takeout toggle — previously an independent, re-askable local `useState` that had no relationship to how the visitor actually arrived — is replaced with a read-only summary of the already-made choice; `OrderService.submitOrder` derives `orderType` from `storeInfo` instead of taking a separate, possibly-inconsistent parameter. `StaffCallButton` (call staff to your table) only renders for dine-in, since there's no table to call staff to on a takeout order.

## Consequences

- Manual entry finally supports takeout, and dine-in visitors pick their real table instead of inheriting a fake default.
- One additional route and one additional tap for the dine-in manual-entry path (order type, then table) versus the old one-tap (wrong-table) shortcut — an intentional trade, since the old flow's speed was purchased by being incorrect.
- `StoreInfo` as a discriminated union means every consumer (`HeaderBar`, `StaffCallButton`, `ConfirmationStep`, `CheckoutSheet`) must narrow on `orderType` before reading `table`, which TypeScript now enforces at compile time instead of allowing an unchecked optional-field read.
- QR/NFC scanning, and the QR scanner's hardcoded "샘플 매장(3번 테이블)" test shortcuts, are untouched — they already encoded `?table=` directly and skip both new screens exactly as before.
- `SelectionCard` (the pressable icon+label+sublabel button) is extracted from `CheckoutSheet` into `components/flow/SelectionCard.tsx` so `OrderTypeSelectView` can reuse it; `CheckoutSheet` still uses it for payment-method selection, which remains a real (non-read-only) choice.

## Alternatives considered

- **Keep table selection as a bottom sheet instead of a route.** Rejected for the same reason ADR 0007 rejected a sheet for settings: this step benefits from being deep-linkable and isn't layered over an in-progress order the way cart/checkout sheets are — there's no "current step" yet to preserve underneath it.
- **A single combined "store + type + table" picker sheet on the landing page**, avoiding a route trip through `/order/{storeId}` entirely. Rejected — QR/NFC tags already resolve `storeId` before this decision is relevant, so the `/order/{storeId}` step already exists as the real entry point for every arrival path; special-casing manual entry to skip it would mean two different resolution flows to maintain instead of one.
- **Leave `table` on `StoreInfo` as a plain optional string** rather than a discriminated union. Rejected — it would let a takeout order carry a leftover table value with no compiler check forcing every read site to handle the takeout case, which is exactly the class of inconsistency (checkout's order type not actually matching how the order was entered) this ADR exists to close.
