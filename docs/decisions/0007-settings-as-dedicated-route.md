# 0007 — Settings moves from a bottom sheet to a dedicated `/settings` route

**Status:** Accepted

## Context

`docs/decisions/0003-navigation-paradigm.md` established that secondary content (cart, product detail, checkout, and originally settings) "layers in as a bottom sheet over the current screen rather than a route change," specifically to preserve the visitor's place in the single-focus wizard.

Settings has grown past what that pattern comfortably holds. By the time `SettingsSheet.tsx` covered high-contrast, font scale, reduced motion, dyslexia spacing, haptics, timeout extension, and language, it was seven stacked cards inside a half-height drawer requiring its own internal scroll — for a panel `docs/architecture.md` explicitly calls "reachable-anytime," used by exactly the low-vision/motor-impaired users this product is built for.

Three properties distinguish settings from the sheets ADR 0003 was actually written for:

1. **Not flow-scoped.** Cart, product detail, and checkout are all *about* the current order — dismissing the sheet returns you to exactly where you were mid-task. Settings isn't about the order at all; there's no "current step" it's interrupting.
2. **Not venue-scoped.** `useAccessibilityStore` already persists under one global key, following the user across every venue (`docs/architecture.md`'s cross-venue persistence section) — it was already conceptually closer to an OS-level settings app than to an in-flow panel.
3. **Big enough to want its own information architecture.** Grouping (테마/화면, 접근성, 결제, 언어) and drill-down sub-screens (접근성 상세, 결제 수단 관리) are exactly what a dedicated screen affords and a single sheet doesn't.

## Decision

`/settings`, `/settings/accessibility`, and `/settings/payment` are real routes (`app/settings/**`), not sheets. Each renders `SettingsHeader` (a back-chevron + title bar, visually matching `HeaderBar`) so the "one focused screen, back affordance top-left" spirit of ADR 0003 is kept — only the *mechanism* (route vs. sheet) changes, not the wizard's overall feel. The settings icon in `HeaderBar` is now a plain link (`<Link href="/settings">`), not a state toggle.

Cart, product detail, and checkout are unaffected — they remain sheets, because they *are* flow-scoped in exactly the way ADR 0003 describes.

## Consequences

- Settings is deep-linkable and back/forward-navigable, which a sheet never was.
- No internal-scroll-within-a-half-height-drawer problem anymore — each settings screen uses the full viewport.
- One more route to keep in the PWA's mental model, but `public/manifest.json`'s `start_url` stays the root fallback regardless (unaffected).
- `SettingsSheet.tsx` is deleted rather than kept as a dead alternate path — nothing referenced it once `HeaderBar` switched to the route.

## Alternatives considered

- **Keep the sheet, split into tabs internally.** Rejected — adds `Tabs` chrome inside a sheet without solving the "not flow-scoped" and "not deep-linkable" issues, and risks the internal-tab-bar pattern ADR 0003 already ruled out at the app-shell level for a different reason (no persistent multi-tab chrome).
- **Keep the sheet, just shorten it.** Rejected — the existing settings surface area (7 concerns, and two new ones this round: 결제 수단 관리 grouping) doesn't actually shrink; hiding it behind less-visible internal navigation inside a sheet would trade one usability problem for another.
