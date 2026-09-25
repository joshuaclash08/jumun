# Changelog

All notable changes to this project are documented in this file, one entry per commit, in the format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This file is a history — entries are appended, never rewritten. For current-state documentation (what the stack/architecture/design system *is* right now, not how it got there), see `plan.md` and `docs/`.

## [Unreleased]

### Added

- `components/flow/WizardOrderView.tsx` — 4-step Wizard ordering flow ("한 화면에 하나의 선택만 제시": Category → Product → Options & Checkout/Add More → Payment) tailored for cognitive clarity and motor impairment accessibility.
- `components/settings/OneHandedModeSelector.tsx` — One-Handed Layout segmented control (`기본(양손)`, `왼손 모드`, `오른손 모드`) to bias interactive controls and action bars into the user's active thumb arc (designed for hemiplegic / stroke aftermath users).
- `hooks/useVoiceGuide.ts` — Web Speech API (TTS) integration providing Korean speech narration for wizard steps, options, and actions with mute/unmute control.
- `tests/unit/wizard.test.tsx` — Unit and axe accessibility tests covering one-handed layout classes, full 4-step wizard flow, multi-item cart accumulation, disclaimer banner, and mode switching.

### Changed

- `lib/types/accessibility.ts` & `store/useAccessibilityStore.ts` — Added `oneHandedMode` and `voiceGuideEnabled` state and setters.
- `app/settings/page.tsx` & `app/settings/accessibility/page.tsx` — Added One-Handed Layout control and Voice Guide toggle.
- `components/flow/MenuClientView.tsx` — Added banner launcher for Wizard mode and seamless switching between standard catalog and wizard ordering.
- `vitest.setup.ts` — Added `IntersectionObserver` mock for headless JSDOM environments.

- `.gitignore` — excludes future build/dependency artifacts; excludes `legacy-reference/` from this repo's tracked history.
- `plan.md` — master roadmap (Phase 1–4), Phase 1 scope boundary (in/out), documentation-set overview, and the standing working agreement (every change gets documented and committed).
- `docs/decisions/0001-onboarding-model.md` — ADR: accessible-by-default with no disability-select gate, replacing legacy's dead-end gated onboarding.
- `docs/decisions/0002-menu-domain.md` — ADR: fictional cafe + light food menu, replacing legacy's unsettled domain (2-item coffee spec vs. real McDonald's-branded shipped mock data).
- `docs/decisions/0003-navigation-paradigm.md` — ADR: single-focus wizard + fixed bottom action bar, replacing legacy's persistent tab dock (which also housed its countdown-timer bug).
- `docs/decisions/0004-voice-scope.md` — ADR: STT voice ordering and custom auto-TTS narration deferred to Phase 2+; native screen reader support stays in scope for Phase 1.
- `docs/tech-stack.md` — full stack documentation: Next.js/TypeScript/Tailwind v4/shadcn(`--base radix`)/Radix/Lucide/Zustand, explicit Framer Motion vs. GSAP vs. Lenis division of responsibility, self-hosted Pretendard + Noto Sans KR, Bun/Cloudflare defaults, and libraries explicitly considered and rejected.
- `docs/architecture.md` — folder structure, service-layer pattern, hooks-as-hardware-interface-wrapper pattern (for a future Phase 2 native port), Zustand state shape, mobile-only viewport policy, and two explicit fixes versus legacy (pinch-zoom must stay enabled; TypeScript build errors must not be silenced).
- `docs/design-system.md` — the project's accessibility spec formalized into concrete design tokens: color palette with computed WCAG contrast ratios (default + AAA modes), type scale, spacing/touch-target scale, focus-ring spec, motion rules including the no-countdown-timer requirement.
- `docs/features.md` — Phase 1 MVP screen-by-screen flow: entry, menu browsing, cart review, checkout, confirmation, and a reachable-anytime (non-gating) settings screen, with per-screen states and cross-cutting requirements.
- `PRODUCT.md` — confirmed product record (users, purpose, positioning, operating context, constraints, principles), written via the impeccable skill's `init` interview.
- `docs/testing-strategy.md` — Vitest unit tests for store/service logic, React Testing Library component tests queried by role/accessible name, automated axe-core checks treated as build-breaking, a manual VoiceOver/TalkBack/keyboard-only/reduced-motion QA checklist, and what's deliberately deferred (visual regression, E2E, load testing).
- `DESIGN.md` — the visual world formalized into the canonical DESIGN.md spec (YAML token frontmatter + 8 canonical sections), written via the impeccable skill's documentation flow. Named "The Well-Lit Counter" as the creative north star; documents an already-decided world (docs/design-system.md's Restrained color strategy and tokens) rather than inventing a new one.
- `docs/decisions/0005-toss-tds-vs-shadcn.md` — ADR: `@toss/tds-mobile` evaluated and rejected as the component foundation (Emotion/React 19 RSC incompatibility, pre-compiled tokens hard to override for this project's accessibility floors); Toss's tactile feel achieved as a token layer over shadcn+Radix instead.
- Runtime dependencies: `zustand`, `motion`, `gsap` + `@gsap/react`, `lenis`, `lucide-react`, `es-hangul`, `es-toolkit`, `pretendard` — everything `docs/tech-stack.md` commits to, installed via `bun add`.
- `components.json`, `lib/utils.ts` — from `bunx shadcn@latest init --base radix --preset nova --no-monorepo` (style records as `radix-nova`, confirming `--base radix` took effect); pulled in `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`.
- Testing infrastructure: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react` + `jest-dom` + `user-event`, `vitest-axe`; `vitest.config.mts`, `vitest.setup.ts`, `vitest-axe.d.ts` (see Fixed), and a real smoke test at `tests/unit/foundation.test.tsx` proving Testing Library + axe actually run, not just configured. `bun run test`/`test:watch` scripts added.
- `lib/types/{menu,cart,order,accessibility}.ts` — the data model from `docs/architecture.md`, transcribed as real code.
- `lib/data/menu.ts` — the fictional cafe menu committed in ADR 0002: 10 invented items across coffee/beverage/dessert/food, with real option groups (temperature, size, milk substitution).
- `lib/services/{MenuService,StoreService,OrderService,AccessibilityService,A11yFeedbackService}.ts` — the service layer contracts from `docs/architecture.md`: mocked latency throughout, `StoreService.resolveStore` returns `null` (never throws) for an invalid link, `OrderService.submitOrder` has a real, deterministically-forceable failure path.
- `store/{useCartStore,useAccessibilityStore}.ts` — Zustand stores per `docs/architecture.md`'s state shape; `useAccessibilityStore` persists under one global (cross-venue) key and seeds `reducedMotion` from the OS preference exactly once via `hasSetReducedMotion`.
- `hooks/{useHaptics,useReducedMotion,useLenisMotionSync}.ts` — the hardware-interface-wrapper pattern: a plain `vibrate()` function usable from both components and services, `useSyncExternalStore` over the OS reduced-motion media query, and Lenis gated behind the app's own store rather than just the OS check.
- `components/a11y/{SkipLink,VisuallyHidden,LiveRegionAnnouncer}.tsx` — `VisuallyHidden` is a thin re-export of Radix's own primitive rather than a reimplementation. `components/layout` and `components/flow` deliberately stay empty — no screens built yet.
- `app/providers.tsx` — seeds `reducedMotion` from the OS preference on a genuinely first visit.
- `app/order/[storeId]/page.tsx` — the real entry point, exercising route param + searchParams parsing → `StoreService.resolveStore` → the invalid-link state end to end.
- `public/manifest.json` — installable PWA metadata; `icons` deliberately left empty, no real assets exist yet.
- `.claude/launch.json` — dev server config for browser-preview tooling.

### Added

- `components/flow/LandingClientView.tsx` & `components/flow/LandingHeroVisual.tsx` — Interactive landing experience with animated floating phone NFC/QR scanning visual, 3-step usage cards, and accessibility/privacy badges.
- `components/flow/QrScannerModal.tsx` — In-browser camera QR code scanner with video stream overlay and direct sample store launcher fallback.
- `docs/animation-guide.md` — Animation and interaction standards specification for Motion, GSAP, and Lenis.
- `components/flow/ProductDetailSheet.tsx` — Quantity Stepper (`-` / `+` buttons) with accessible min/max bounds and live option summary pricing computation.
- `components/flow/CheckoutSheet.tsx` — Order summary item list, payment method selection (`card` / `easy-pay`), and robust error state banner with preserved cart state and retry CTA.
- `components/flow/MenuClientView.tsx` — Bidirectional category sync via `IntersectionObserver`, and a Staff Call ("직원 호출") escape hatch modal.
- `components/flow/SettingsSheet.tsx` — Added Timeout Extension ("안내 메시지 표시 시간 2배 연장") switch.
- `app/page.tsx` & `app/order/[storeId]/page.tsx` — Added direct link to sample cafe store for direct/invalid visits.
- `tests/unit/components.test.tsx` — Unit and accessibility tests for `CartDrawer` and `ConfirmationStep` with real item names and options.

### Changed

- `lib/types/cart.ts` — Added `nameKo` and `optionsSummary` properties to `CartItem` interface to snapshot readable names at add-time.
- `components/flow/CartDrawer.tsx` — Replaced raw product ID with readable `item.nameKo`, rendered `optionsSummary`, added accessible quantity adjust buttons and an interactive empty state action.
- `components/flow/ConfirmationStep.tsx` — Rendered receipt with itemized product names, options summary, store/table metadata, and formatted timestamp.
- `components/flow/ProductCard.tsx` — Added category-specific icon illustrations (☕, 🥤, 🍰, 🥪) with accessible color pairings and sold-out aria label handling.
- `vitest.setup.ts` — Mocked `canvas-confetti` for headless test environments.
- `app/globals.css`, `DESIGN.md`, `docs/design-system.md`, `public/manifest.json` — Switched background palette from warm linen `#F7F3EC` to crisp bright production white `#FFFFFF`, maintaining full AA (16.9:1 body, 7.6:1 meta) and AAA (21:1 pure black) contrast compliance.
- `app/layout.tsx`, `components/ui/drawer.tsx`, `components/flow/CartSummaryPill.tsx`, `components/flow/A11yToastContainer.tsx` — Adjusted container viewport max width to Galaxy Z Fold 5 unfolded resolution (`max-w-[768px]`, ~736px inner pill/toasts) so Fold 5 screens fill naturally without side cuts, while desktop browsers center the mobile frame.
- `store/useCartStore.ts` — Fixed `clearCart` to only clear item lines while preserving `orderStatus: "confirmed"` and `lastReceipt`, and introduced `resetOrder` for clean session resets.
- `mcp_config.json` — Configured Playwright MCP to use Brave Browser (`/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`) in headed mode.

- `plan.md` — corrected the Phase 4 framing: the web experience is a permanent, fully-supported channel once the native app ships, not a fallback for people who haven't installed yet. Added the combined QR+NFC physical tag detail and a note on the longer-term multi-vertical platform vision (food ordering is the first proof of concept, not the ceiling). Updated "Current status" from documentation-stage to foundation-stage. Updated the documentation-set table to include `PRODUCT.md`, `DESIGN.md`, and `docs/testing-strategy.md`.
- `docs/design-system.md` — substantially expanded via the impeccable skill's design-calibration principles: a "Visual direction" section stating and justifying the Restrained color strategy and workhorse typography choice for this Operate-mode surface, and explicitly naming which common AI-generated-interface clichés were deliberately avoided; an explicit floor-vs-actual reconciliation for the contrast values (4.5:1/7:1 are enforced floors, ~15:1/~17:1 are where the defaults actually land); new elevation, corner-radius, and button-hierarchy token scales; an imagery-treatment decision (flat illustration, not fake photography, given no real photos exist); loading-state and empty-state patterns; a screen-reader content-authoring section with concrete per-component-type examples; and safe-area-inset handling for the fixed bottom bar.
- `docs/features.md` — added the cross-venue settings-carryover behavior to Entry; per-screen motion choreography (which library owns which transition, and why); a mocked order-failure path with preserved cart state; a new "Error and failure states" section (menu load failure, invalid/expired link, and the accessibility treatment failures get); and receipt content detail on Confirmation.
- `docs/architecture.md` — added a concrete TypeScript data model (Product/CartItem/StoreInfo/OrderReceipt/AccessibilitySettings), full service-layer function signatures with the deliberate null-vs-throw convention for expected failures, safe-area-inset technical handling (`viewport-fit=cover`, `env(safe-area-inset-bottom)`), and an explicit note on why cart/store state and accessibility settings have different persistence scopes.
- `docs/tech-stack.md` — added a Testing section (Vitest, React Testing Library, @axe-core/react); added evaluation of Toss TDS (@toss/tds-mobile) vs Shadcn UI + Radix with Toss design language, and included Toss ecosystem utilities (`@toss/es-toolkit`, `es-hangul`).
- `docs/tech-stack.md` — production-feasibility pass: documented Pretendard's real npm sourcing path and the `weight: '45 920'` requirement (omitting it renders the wrong weight in WebKit/Safari — verified live, and directly relevant since iOS Safari is an explicit target browser); flagged a live, currently-open compatibility risk between Next.js 16's `proxy.ts` rename and `@opennextjs/cloudflare`'s Wrangler-facing build logic (tracked upstream, not a Phase 1 blocker); documented the i18n approach (static dictionary + hook, no framework) so it doesn't get invented ad-hoc later; linked `docs/decisions/0005-toss-tds-vs-shadcn.md` from the Toss TDS comparison table instead of only summarizing inline.
- `docs/architecture.md` — production-feasibility pass: fixed a stale "nothing is scaffolded yet" line; clarified the previously-ambiguous split between root `page.tsx` (manual-entry fallback route) and `/order/[storeId]` (the actual QR/NFC-encoded entry point); added concrete PWA `manifest.json` fields including why `start_url` is the root fallback rather than a specific store route.
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx` — shadcn's generic neutral scaffold replaced with Jumun's real design tokens (mapped onto shadcn's own variable names, not a parallel system), Pretendard/Noto Sans KR fonts, the corrected viewport config, and an honest minimal placeholder instead of `create-next-app`'s default boilerplate. Verified live in a browser (not just build/typecheck) — see the foundation-code commit for exact computed values checked.

### Removed

Nothing yet.

### Fixed

- Corrected "Framer Motion" references to **Motion** (package `motion`, `import { motion } from "motion/react"`) across `docs/tech-stack.md`, `docs/features.md`, `docs/design-system.md`, and `PRODUCT.md` — verified live against current docs before scaffolding: Framer Motion rebranded, and `framer-motion` (what legacy's `package.json` used) is now the outdated/compatibility package name. Caught before installing anything, not after.
- Corrected `@toss/es-toolkit` to **`es-toolkit`** (unscoped) in `docs/tech-stack.md` — the scoped name doesn't exist on npm (404 on `bun add`, not a network issue). The library is real and Toss-maintained, just published unscoped under the `toss` GitHub org. Caught by the install itself failing, fixed immediately rather than left stale in the docs.
- See `docs/architecture.md` for regressions identified in `legacy-reference/` that this project's plan deliberately does not inherit (disabled pinch-zoom, silenced TypeScript build errors, a dead-end onboarding button, a countdown-timer inactivity warning, real third-party trademarked content in mock data). These aren't "fixes" in this project's own history since the buggy code was never part of this repo — they're documented as decisions not to repeat them.
- `tsconfig.json`'s and `eslint.config.mjs`'s `exclude`/`globalIgnores` only listed build artifacts, not `legacy-reference/` — since it uses the same `@/*` import alias as this project, `tsc --noEmit` and `eslint` were both silently type-checking and linting all of legacy's code as if it were this project's own, producing dozens of unrelated errors. Both configs now exclude `legacy-reference/`.
- `vitest-axe@0.1.0` ships its TypeScript augmentation against Vitest's older global `Vi` namespace, which doesn't connect to Vitest 4's actual `Assertion` type (a real version-compatibility gap in the library's own types, not a mistake on this project's end — the runtime matcher already worked correctly via `expect.extend`). Added `vitest-axe.d.ts` with the modern `declare module "vitest"` augmentation, the same pattern `@testing-library/jest-dom`'s own types already use.
- Removed `@emotion/react`, `@toss/tds-mobile`, and `@toss/tds-mobile-ait` from `package.json`/`bun.lock`. These appeared between one `bun add` call (which installed exactly 9 named packages, none of them these three) and the next commit, without ever being intentionally added in this session. Regardless of origin, they directly contradict `docs/decisions/0005-toss-tds-vs-shadcn.md`'s already-settled rejection of TDS Mobile for React 19/RSC incompatibility, so removed on that basis.

### Added

- `docs/ux-audit.md` — full UI/UX, structure, logic, and system audit of the app as it stood at the start of this round: data hardcoding, the category-scroll flicker bug and its root cause, IA problems (buried staff-call button, oversized settings sheet), layout/space-usage issues, a full evidence-based accounting of shadcn/design-token fragmentation, and per-item decisions for each requested change.
- `lib/data/menu.json`, `lib/data/stores.json` — menu and store catalog moved out of hardcoded TS into JSON (per-product `icon`, price, and option groups all inline; option groups deduplicated via a shared `optionGroups` dict + `optionGroupIds` reference so the three coffee items don't each repeat the same temperature/size/milk definitions). `lib/data/menu.ts` deleted.
- `lib/types/store.ts` (`StoreListing`) — the store-listing shape now lives in `lib/types` alongside the rest of the data model instead of being defined ad hoc inside `StoreService.ts`.
- `docs/decisions/0007-settings-as-dedicated-route.md` — ADR: settings moves from `SettingsSheet` (a bottom sheet) to a dedicated `/settings` route, explicitly departing from ADR 0003's "sheet, not route change" default for the specific reasons settings doesn't fit that pattern (not flow-scoped, not venue-scoped, big enough to want its own IA).
- `app/settings/page.tsx`, `app/settings/accessibility/page.tsx`, `app/settings/payment/page.tsx` — the settings screen, split into a grouped list (테마/화면, 접근성, 결제, 언어) with two drill-down sub-screens, replacing the single 7-card `SettingsSheet` drawer.
- `components/settings/{SettingsHeader,SettingsRow}.tsx` — shared back+title header and list-row/group primitives for the settings screens.
- `store/usePaymentStore.ts` — persists which of the two mocked payment methods (card / easy-pay) `CheckoutSheet` preselects; no real payment credential is ever collected, consistent with Phase 1 having no real payment processing.
- `components/flow/StaffCallButton.tsx` — the 직원 호출 (staff call) trigger, now a persistent icon button in `HeaderBar` next to settings, with its own Drawer confirmation (previously a `Dialog`, buried as a card at the bottom of the scrollable menu in `MenuClientView`).
- Landing page: wired up the previously-built-but-unused `QrScannerModal` behind a "카메라로 QR 스캔해보기" link — `app/page.tsx`'s own comment already promised a "live QR camera scanner modal" that nothing actually triggered.

### Changed

- `components/flow/MenuClientView.tsx` — fixed the category-header scroll flicker: the `IntersectionObserver` callback picked whichever intersecting entry came last in `entries.forEach`, so two adjacent short sections intersecting the detection band in the same callback batch would flip the active tab back and forth. Now picks the single topmost intersecting entry and only commits a state update when it actually changes.
- `components/flow/MenuCategoryHeader.tsx` — replaced `role="tablist"`/`role="tab"`/`aria-selected` (a scrollspy has no `tabpanel` to pair with, so this promised screen-reader users keyboard-tab behavior that didn't exist) with plain buttons and `aria-current`.
- `components/flow/LandingHeroVisual.tsx` — the NFC/QR shape-swap `setInterval` now stops entirely when `reduceMotion` is on, instead of continuing to swap shapes every 3s with only the cross-fade duration zeroed out (a resulting strobe the reduced-motion setting was supposed to eliminate, not soften).
- `components/flow/LandingClientView.tsx` — cut the redundant explainer sentence under the hero copy down to a single reassurance line ("앱 설치 없이 바로 연결돼요"); the mechanism it used to describe is already carried by the heading and the animated visual. Store-selector section dropped its arbitrary `max-w-sm` (narrower than the app's actual `max-w-[768px]` shell) in favor of the full shell width, and each store row is now a proper `Card` matching the rest of the app's list-row treatment instead of a bespoke divided-list pattern.
- `components/layout/HeaderBar.tsx` — settings icon is now a `Link` to `/settings` instead of a Drawer-opening state toggle; gained `StaffCallButton` beside it.
- `components/flow/ProductCard.tsx` — one icon per product (from `lib/data/menu.json`, named-imported per icon actually used so unused `lucide-react` icons stay tree-shaken) instead of one icon per category, so items in the same category are visually distinguishable. Icon container shrunk (80px → 64px) and padding tightened so the card reads less empty; corner radius and boundary now use the shared design tokens instead of the previous double `Card`-ring-plus-manual-border.
- `components/flow/QrScannerModal.tsx` — converted from a centered `Dialog` to a `Drawer` to match the rest of the app's one sheet pattern; camera-error emoji (📷) replaced with a `Camera` icon.
- Design-token consistency pass across `ProductCard`, `CartDrawer`, `CheckoutSheet`, `ConfirmationStep`, `ProductDetailSheet`, `A11yToastContainer`, `LandingClientView`, and `app/order/[storeId]/page.tsx`: removed the redundant `border-border/60` stacked on top of `Card`'s own `ring-1 ring-foreground/10` (DESIGN.md's Cards section already specifies "no border by default"); replaced ad hoc `rounded-2xl`/`rounded-3xl`/`rounded-xl`/`rounded-lg` with the four documented radius tokens (`rounded-[--radius-sm|md|lg|xl]`); replaced the remaining raw emoji (🛒 empty-cart, ⚠️ checkout error) with `lucide-react` icons to match the rest of the app's icon system.
- `DESIGN.md`, `docs/design-system.md` — reconciled a three-way color-token drift: `DESIGN.md`'s frontmatter said `surface: "#FFFFFF"`, `docs/design-system.md`'s Elevation section said `--color-surface (#FBF9F5)`, and the actual shipped value in `app/globals.css` was `--card: #f9f8f6`. Both docs now read `#F9F8F6`, matching the code. Also renamed the retired "Lifted Linen / Warm Linen / Warm Slate / Faint Linen Line" palette names (left over from an earlier, since-abandoned color scheme) to the names actually in current use (Card Surface / Bright White / Muted Slate / Subtle Divider) throughout the Cards, Bottom Sheets, Inputs, and Named Rules sections.
- `docs/features.md`, `docs/architecture.md` — updated the Settings section and folder-structure listing for the new `/settings` route, `components/settings/`, `store/usePaymentStore.ts`, and the JSON data files.
- `lib/services/MenuService.ts`, `lib/services/StoreService.ts` — now read from `lib/data/*.json` instead of hardcoded TS arrays; `Promise`-based signatures unchanged.
- `components/flow/CheckoutSheet.tsx` — default payment method now seeded from `usePaymentStore` instead of hardcoded to `"card"`.
- `tests/unit/components.test.tsx` — added the now-required `icon` field to the sample `Product` fixture.

### Removed

- `components/flow/SettingsSheet.tsx` — replaced by the `/settings` route; nothing referenced it once `HeaderBar` switched to the link.
- `lib/data/menu.ts` — replaced by `lib/data/menu.json`.

### Changed

- `app/globals.css` — `--card` bumped from a near-imperceptible `#f9f8f6` (~1.03:1 against `--background`) to `#efece4` (~1.18:1), and the AAA/high-contrast card token similarly darkened, so a screen of cards reads as distinct objects instead of a flat white field. Text contrast on the surface only improves from this (15:1+ default, 16:1+ AAA), so no accessibility floor is at risk. Also registered `--shadow-resting`/`--shadow-layered`/`--shadow-floating` as Tailwind v4 theme tokens (auto-generating matching `shadow-*` utilities) using the Deep Charcoal tint `docs/design-system.md`'s Elevation table specifies — previously every card just used Tailwind's generic `shadow-xs`, so the documented elevation scale and the shipped elevation had silently drifted apart.
- `components/flow/ProductCard.tsx` — icon tiles are now tinted per category (coffee/amber, beverage/sky, dessert/pink, food/orange) instead of one flat gray for every item, deliberately kept separate from Jumun Blue so it doesn't compete with the One Accent Rule's single CTA color.
- `components/settings/SettingsRow.tsx`, `app/settings/page.tsx`, `components/flow/CartDrawer.tsx` — icon tiles switched from flat gray to the same `bg-primary/10 text-primary` tint already used for the landing page's store icons, for a less monotone settings/empty-state look.
- `components/ui/drawer.tsx` — `DrawerContent` now carries `shadow-layered` (previously no shadow at all on sheets beyond the browser-default overlay).
- `DESIGN.md`, `docs/design-system.md` — updated the Card Surface hex, Shadow Vocabulary rgba values (now the actual Deep Charcoal `rgb(17,24,39)` rather than the retired palette's `rgb(33,30,26)`), and documented the category icon-tint palette as a deliberate carve-out from the One Accent Rule.

### Added

- `.claude/skills/toss-design` (note: lives at `~/.claude/skills/toss-design`, outside this repo — not tracked here) — a persistent skill packaging a merged Toss Design System reference used to drive the token realignment below.
- `docs/decisions/0008-toss-visual-realignment.md` — ADR: token-level realignment to the Toss Design System reference (Toss Blue primary, pure-white surfaces, the Border-and-Shadow card rule superseding Never-Alone). Documents exactly which Toss values were adopted literally, which were deliberately kept off-spec for verified accessibility reasons (destructive red, the pure-white background tradeoff), and why.
- `docs/decisions/0011-graduated-radius-scale.md` — ADR: the shipped radius scale is a 7-step graduated "squircle" system (buttons 10–18px by size, cards/sheets 20–32px), not the flat 12px-everywhere scale ADR 0008 originally specified — a later redesign pass superseded 0008's scale before it was ever committed. This history records the graduated scale as what actually shipped.
- `docs/component-standards.md` — prescriptive component-level standards from a full-codebase audit: icon/illustration tile sizes per context (list row 56px / detail sheet 64px / carousel 96px), button size/variant usage rules (`cta` vs `lg`, close-button standard, stepper standard), settings row/card usage split, overlay-primitive policy (`Drawer` is the only bottom-sheet primitive in active use; `sheet.tsx`/`dialog.tsx` are dead code), toast model, radius-authoring convention.

### Changed

- `app/globals.css` — full Toss token realignment: `--primary` → Toss Blue `#0064ff` (4.92:1 on white, still clears the 4.5:1 floor), `--background`/`--card` → pure `#ffffff`, `--foreground` → `#191f28`, `--secondary` restyled as a tinted-blue wash (`#e8f3ff` fill / `#0050d9` text), `--ring` now the accent blue itself, radius scale repointed to the graduated 7-step squircle system, elevation shadow rgba recolored onto the new foreground. `--destructive` deliberately **not** changed to Toss's literal `#ff4040` — see `docs/decisions/0008` (computed 3.47:1, fails this codebase's 4.5:1 floor as `text-destructive` actually renders).
- `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`, `components/ui/tabs.tsx` — radius/shadow tokens repointed to the graduated scale; boundary on `card.tsx` now reads via a literal `border border-border` plus `shadow-resting` instead of a `ring-1 ring-foreground/10` simulation (**Border-and-Shadow Rule**). `badge.tsx` and `button.tsx`'s `xs` size also grew (height/padding/icon) to fit the 16px text-size floor — see that entry below.
- `DESIGN.md`, `docs/design-system.md` — rewritten to match the shipped tokens: color/typography/radius/elevation/button-hierarchy tables recomputed with fresh contrast ratios, two new Named Rules documented (**Border-and-Shadow**, superseding Never-Alone; **Status-Color Exception**, documenting why destructive red didn't adopt Toss's literal hex).

### Changed — UI primitive cleanup

- `components/ui/drawer.tsx` — bottom-sheet corner radius and shadow (`shadow-layered`) repointed to the new token scale.
- `components/ui/switch.tsx` — upgraded to a Toss-style tactile 50×30px toggle with a 26px thumb and spring slide.

### Removed

- `components/ui/dialog.tsx`, `components/ui/sheet.tsx` — deleted. Per `docs/component-standards.md`'s overlay-primitive audit, `Drawer` is the only bottom-sheet primitive in active use; both were unreferenced dead code.

### Added — illustration set & featured carousel

- `components/ui/TossIllustrations.tsx` — hand-authored flat-vector illustration suite for every menu item (Americano, Latte, Cold Latte, Matcha, Ade, Lemonade, Cheesecake, Cookie, Sandwich, Brunch) and interactive status graphics (empty cart, staff-call bell, celebration check).
- `components/flow/FeaturedMenuSection.tsx` — horizontal snap-scrolling "추천 메뉴" carousel with 14px-radius cards, BEST tags, and quick item select.
- `components/ui/RollingPrice.tsx` — odometer-style animated price counter; each digit column animates independently with spring physics, respects `reducedMotion`, screen-reader accessible via an `ariaLabel` prop. Wired into `CartSummaryPill`, `CheckoutSheet`, `CartDrawer`, and `ProductDetailSheet`.
- `components/flow/MenuSearchSection.tsx` — "원하는 메뉴를 못 찾으시겠나요?" fallback search section wired into `MenuClientView`, filtering the catalog by name/description/category client-side.
- `docs/decisions/0012-top-left-navigation-and-large-card-grid.md` — ADR for the navigation/grid changes below.

### Changed — menu & product flow redesign (ADR 0012)

- `components/flow/ProductCard.tsx`, `components/flow/MenuCategoryHeader.tsx` — menu browsing moved from a 1-column list to a **2-column large card grid** (`grid grid-cols-2 gap-3.5`) matching Toss's mobile feed layout (`h-36` squircle visual container, floating status badges, 2-line title, tabular price).
- `components/flow/{StaffCallButton,CartDrawer,CheckoutSheet,QrScannerModal,ProductDetailSheet}.tsx` — unified onto a standardized top-left `ChevronLeft` back button (44×44px, `rounded-[14px]`), replacing top-right `X` close buttons; close-button and quantity-stepper sizing also unified to the app's 44px/32px touch-target standards (previously 36–40px and 28px in places).
- `components/flow/ProductDetailSheet.tsx` — added a hero visual stage (`h-52 sm:h-60 rounded-[24px]`), categorized option chips with a selection bounce, tactile quantity stepper, fixed bottom CTA.

### Added — motion & fonts

- `public/fonts/PretendardVariable.woff2` — self-hosted copy of the official Pretendard 1.3.9 release (byte-identical to the removed npm package's copy).
- `docs/decisions/0009-motion-only-animation.md` — ADR: GSAP and `@gsap/react` removed; the one call site that used them (`ConfirmationStep.tsx`'s receipt-reveal stagger) is fully expressible with Motion's `variants`/`staggerChildren`.
- `docs/decisions/0010-deeper-press-feedback.md` — ADR: press-feedback scale deepened app-wide on a two-tier standard (content controls `0.96`, icon/chip controls `0.90`), replacing a fuzzy `0.94`–`0.98` range.

### Changed — motion & fonts

- `app/layout.tsx` — Pretendard font source switched from `next/font/local` over the npm package to `public/fonts/PretendardVariable.woff2`; outer desktop-shell background moved off a hardcoded hex onto `bg-muted`.
- `components/flow/ConfirmationStep.tsx` — GSAP timeline replaced with Motion `variants` (`receiptContainer`/`receiptItem`/`successPop`); confetti trigger moved to a plain `useEffect`; confetti particle palette swapped to the new Toss token family. `receipt-element` CSS-selector class removed as no-longer-meaningful.
- `components/flow/MenuClientView.tsx` — the menu ↔ confirmation screen swap wrapped in `AnimatePresence`. Fixed a bug caught while verifying the transition: nesting `CheckoutSheet` inside the "menu" `AnimatePresence` branch meant a successful order could leave the checkout drawer stuck open showing a stale cart, because the screen-unmount and the drawer's own close transition fought each other. Fixed by hoisting `CartSummaryPill`/`ProductDetailSheet`/`CartDrawer`/`CheckoutSheet`/`A11yToastContainer` out of both branches into unconditional siblings (each already self-gates via its own `open` prop).
- `docs/animation-guide.md` — GSAP references removed from the library-role table; press-scale standard rewritten into the two explicit tiers above, with a new "Celebratory / Content-Emphasis Motion" subsection documenting the `successPop` pattern.
- Press-feedback scale deepened at every `whileTap` call site app-wide (`components/settings/SettingsRow.tsx`, `components/flow/{StaffCallButton,FeaturedMenuSection,ProductDetailSheet,CheckoutSheet,CartSummaryPill,LandingClientView,ProductCard,MenuCategoryHeader}.tsx`, `components/layout/HeaderBar.tsx`, `app/settings/{page,payment/page}.tsx`) plus the two CSS-only `:active` fallbacks (`components/ui/button.tsx`, `app/order/[storeId]/page.tsx`).
- `DESIGN.md`, `docs/design-system.md`, `PRODUCT.md`, `docs/features.md`, `docs/tech-stack.md` — GSAP references updated to reflect the Motion-only animation layer; Pretendard sourcing note updated to the self-hosted path.

### Removed

- `gsap`, `@gsap/react`, `pretendard` npm dependencies (`bun remove`) — no longer referenced anywhere in source.

### Changed — 16px text-size floor enforcement

Every `text-xs` (12px) and `text-sm` (14px) instance across the app bumped to `text-base` (16px) — this product's own documented, non-negotiable text-size floor. `components/ui/badge.tsx` (`h-5`→`h-7`, `px-2 py-0.5`→`px-2.5 py-1`, `size-3`→`size-3.5`) and `button.tsx`'s `xs` size (`h-7`→`h-8`, `px-2`→`px-2.5`, `size-3`→`size-3.5`) grew to fit the larger text; `button.tsx`'s `default`/`sm` sizes and every shared UI primitive (`card.tsx`, `drawer.tsx`, `tabs.tsx`) lost their `text-sm`; `card.tsx`'s compact title no longer shrinks (`group-data-[size=sm]/card:text-sm` removed, no step below the floor remains). After this pass `text-xs`/`text-sm` are fully absent from the codebase.

### Changed — settings & accessibility

- `components/flow/LandingClientView.tsx` — hero stage, service-guide cards, and store list restyled to the graduated squircle token scale and press-feedback standard.
- `components/flow/LandingHeroVisual.tsx` — hero visual sized down on narrow viewports (`h-48 w-48` → `h-32 w-32 sm:h-40 sm:w-40`, inner glyphs `h-32 w-32` → `h-24 w-24 sm:h-28 sm:w-28`) to fit the redesigned hero card.
- `components/layout/HeaderBar.tsx`, `components/settings/{SettingsRow,SettingsHeader}.tsx`, `components/flow/A11yToastContainer.tsx` — restyled to the new token/radius/press-feedback system; `SettingsRow`'s `SettingsCard` gained an `ariaPressed?: boolean` prop, forwarded to its internal button's `aria-pressed` in selectable-card mode.
- `app/template.tsx` — new page-level slide/fade transition wrapper (zero-duration fallback under `reducedMotion`).
- `app/settings/page.tsx` — dyslexia-spacing, haptics, and timeout-extension controls consolidated onto the main settings page (previously only on the accessibility sub-page); font-scale selector rebuilt as a segmented pill control wrapped in `SettingsGroup` card containers; `size="cta"` swapped for `size="lg"` (`cta`'s 64px height is now reserved for `CartDrawer`/`CheckoutSheet`/`ProductDetailSheet`/`CartSummaryPill`); added a "초기화" reset flow that clears local/session storage and `resetAll()`s the accessibility store, and a "설정 완료" done button.
- `app/settings/accessibility/page.tsx` — added an auto-save confirmation banner and a bottom "설정 완료" done button; `size="cta"` swapped for `size="lg"`; timeout-extension copy corrected (was documented as 4s→8s, actually 3s→7s).
- `app/settings/payment/page.tsx` — payment-method cards now render via the shared `SettingsCard` instead of ~90% hand-duplicated markup; `size="cta"` swapped for `size="lg"`.
- `app/order/[storeId]/page.tsx` — invalid-link CTA radius and press-feedback aligned to the new tokens.
- `store/useAccessibilityStore.ts` — added `applyPreset("visual" | "hearing" | "reading" | "senior")` and `resetAll()` actions, covered by new unit tests; `applyPreset` is not yet wired to a preset-picker UI.
- `docs/ux-planning-2026-08.md` — planning-only UX audit covering every page/popup/setting (close-button size drift, stepper size drift, `cta`-but-actually-56px mislabeling, `SettingsCard`/payment-page markup duplication, the text-size-floor violations above); findings applied this round marked accordingly.

### Changed — data & utilities

- `lib/types/menu.ts` — `ProductCategory` expanded from 4 fixed categories (`coffee`/`beverage`/`dessert`/`food`) to 9 explicit categories (adds `decaf`, `tea`, `bakery`, `brunch`, `md`) plus an open string union for forward compatibility.
- `lib/data/menu.json` — catalog expanded with items across the new categories.
- `lib/utils.ts` — added `generateUUID()`, a `crypto.randomUUID` wrapper with a manual fallback for insecure contexts (plain HTTP on a local network IP, where `crypto.randomUUID` is `undefined` on mobile browsers); `lib/services/A11yFeedbackService.ts` switched its toast-ID generation to it.
- `next.config.ts` — added `allowedDevOrigins` so the dev server can be reached from LAN device IPs during on-device testing.
- `tests/unit/components.test.tsx` — `ProductCard`'s accessible-label test updated to match the simplified "name, price" label (was the full `voiceDescriptionKo`); added `FeaturedMenuSection` render/click coverage.
- `tests/unit/useAccessibilityStore.test.ts` — coverage for `applyPreset`/`resetAll`.

### Fixed

- `components/flow/LandingHeroVisual.tsx` — an earlier entry in this changelog recorded this file as "verified, not modified" during the Toss token realignment; it was in fact resized on a later pass (see above). Recorded here rather than editing that entry, per this file's own append-only policy.
- An earlier draft of this changelog claimed `public/toss-assets/` (198 extracted Figma assets) was added to this repo. It was not — the illustration work shipped as hand-authored `components/ui/TossIllustrations.tsx` instead. The `toss-design` skill itself does exist, but only at `~/.claude/skills/toss-design`, outside this repo's tracked history.
- Verified (not a bug): `w-38` (`FeaturedMenuSection.tsx`) and `h-13` (`LandingClientView.tsx`) both resolve correctly (152px/52px via computed style) — Tailwind v4's dynamic spacing scale generates arbitrary steps like these on demand.

### Added — manual-entry order type & table selection (ADR 0014)

- `docs/decisions/0014-entry-order-type-and-table-selection.md` — ADR: manually-selected stores (the home screen's "직접 매장 선택하기" list) no longer inherit a fake `defaultTable`; `/order/[storeId]` with no query params is now a dine-in/takeout choice, and dine-in routes on to a dedicated table-number screen instead of guessing.
- `components/flow/OrderTypeSelectView.tsx` — the dine-in-vs-takeout screen rendered by `/order/[storeId]` when neither `?table=` nor `?type=takeout` is present; takeout resolves the menu immediately, dine-in continues to the table picker.
- `app/order/[storeId]/table/page.tsx`, `components/flow/TableSelectView.tsx` — new dedicated route: a grid of every table number up to the store's `tableCount`, reached only from the dine-in choice above.
- `components/flow/SelectionCard.tsx` — the pressable icon+label+sublabel button extracted from `CheckoutSheet` so `OrderTypeSelectView` can reuse it; `CheckoutSheet` still uses it for payment-method selection.
- `components/flow/InvalidOrderLinkNotice.tsx` — the "주문 링크를 찾지 못했어요" empty state extracted from `app/order/[storeId]/page.tsx` so the new table-selection route can show the same notice for an unknown `storeId`.
- `lib/services/StoreService.ts` — `getStoreListing(storeId)`, a synchronous existence lookup used by both new screens before a table is known.

### Changed — manual-entry order type & table selection (ADR 0014)

- `lib/types/store.ts` — `StoreListing.defaultTable: string` replaced with `tableCount: number`; `lib/data/stores.json` updated (12/10/8 tables for the three seed stores) — the old field was one arbitrary sample table, not a real per-store roster.
- `lib/types/order.ts` — `StoreInfo` changed from `{ storeId, storeName, table }` to a discriminated union on `orderType`: dine-in carries `table`, takeout doesn't. A takeout order can no longer type-check with a stale or fabricated table value.
- `lib/services/StoreService.ts` — `resolveStore(storeId, table)` became `resolveStore(storeId, orderType, table?)`; `table` is now required only for `orderType: "dine-in"`.
- `lib/services/OrderService.ts` — `submitOrder` drops its separate `orderType` parameter; the receipt's `orderType` is now derived from `storeInfo.orderType` instead of a second, possibly-inconsistent value.
- `app/order/[storeId]/page.tsx` — now branches three ways: `?table=` resolves dine-in (QR/NFC and the table picker both produce this), `?type=takeout` resolves takeout, and neither renders `OrderTypeSelectView`; the invalid-link empty state moved into the shared `InvalidOrderLinkNotice` component and its fallback link dropped the hardcoded `?table=1`.
- `components/flow/LandingClientView.tsx` — the "직접 매장 선택하기" store list links to `/order/{storeId}` with no query params instead of `/order/{storeId}?table={store.defaultTable}`.
- `components/flow/CheckoutSheet.tsx` — the "식사 장소" dine-in/takeout toggle (a re-askable local `useState`, independent of how the order was actually entered) replaced with a read-only summary row reflecting `storeInfo.orderType`, decided once at entry.
- `components/layout/HeaderBar.tsx`, `components/flow/ConfirmationStep.tsx` — the table badge/receipt line now shows "포장" for takeout instead of assuming a table always exists.
- `components/flow/MenuClientView.tsx`, `components/flow/StaffCallButton.tsx` — `StaffCallButton` (call staff to your table) only renders for dine-in orders; its prop type narrows to the dine-in variant of `StoreInfo` so this is enforced at compile time, not just by the render gate.
- `tests/unit/{components,OrderService,useCartStore}.test.ts(x)` — fixtures updated for the `StoreInfo` discriminated union and `OrderService.submitOrder`'s new signature.

### Changed — takeout cart pill fills the space `StaffCallButton` left behind

- `components/flow/CartSummaryPill.tsx` — new `reserveStaffCallSpace` prop (defaults `true`); when `false`, the pill's left padding drops from `pl-[76px]` (space reserved for `StaffCallButton`'s bottom-left circle) to `pl-4`, matching its right padding. Previously that space stayed empty for takeout since the pill never expanded to claim it.
- `components/flow/MenuClientView.tsx` — passes `reserveStaffCallSpace={storeInfo?.orderType === "dine-in"}`, so takeout's "주문하기" pill spans the full width now that no staff-call button shares the bottom bar. Chosen over adding a takeout-specific bottom-left affordance (e.g. a repurposed help/pickup-info button) — see conversation for the alternatives considered.

### Added — real menu photography (ADR 0013)

- `docs/decisions/0013-menu-photography.md` — ADR: menu/product imagery moves from flat illustration (`TossIllustrations.tsx`) to real photography for the menu grid card, featured/BEST carousel, and product-detail hero stage, superseding `DESIGN.md`'s prior illustration-only rule for those three surfaces. Empty/celebratory states (empty cart, staff-call) are explicitly out of scope and stay illustrated.
- `public/images/menu/*.jpg` — 30 photo assets (19 catalog items, several with a refreshed `-v2` pass) backing the new `imageUrl` values in `lib/data/menu.json`.
- `lib/types/menu.ts` — `Product` gains an optional `themeBg` (solid hex) used as the card's base tint/backdrop-blur color, matched per item to its photo.
- `docs/component-standards.md` — flagged §1's icon/illustration tile table as stale against the live photo-card implementation, pending a follow-up re-measure once the card redesign below settled (this pass is that follow-up).

### Changed — menu/featured cards move to full-bleed photo (ADR 0013), then a natural blur+fade over a flat tint

- `components/flow/ProductCard.tsx`, `components/flow/FeaturedMenuSection.tsx` — replaced the `Card`-wrapped fixed-height photo tile (illustration-era layout) with a full-bleed photo filling the entire card; the name/price info panel is now an absolutely-positioned overlay at the bottom instead of a separate stacked block.
- Same two files, this pass: the info panel's tint dropped from a flat `${cardBg}E8` (91% alpha) block with a hard `border-t` seam to `${cardBg}4D` (~30% alpha, liquid-glass level) with `backdrop-blur-sm` (down from `-md`, so the photo stays legible through the glass instead of fogging), both faded out via a shared, deliberately long `mask-image: linear-gradient(to top, black 30%, transparent 100%)` (the same fade technique every sheet's `DrawerFooter` already uses, e.g. `CheckoutSheet`/`CartDrawer`/`ProductDetailSheet`/`StaffCallButton`) — the tint and blur blend gradually into the photo well above the text instead of cutting off at a flat line or fading abruptly.

### Added — accessible checkbox primitive & settings migration

- `components/ui/checkbox.tsx` — new Radix-based Checkbox primitive with Toss-token styling, three sizes (`sm: 20px`, `default: 24px`, `lg: 28px`), and high-contrast check indicators.
- `tests/unit/settings.test.tsx` — comprehensive unit and axe accessibility test suite covering Checkbox interaction, settings toggles without decorative icons, auto-save feedback, and default payment method selection with zero violations.

### Changed — settings UI & accessibility refinements

- `app/settings/page.tsx`, `app/settings/accessibility/page.tsx`, `app/settings/payment/page.tsx` — removed decorative icons from list rows for a cleaner, text-focused presentation; switched toggle rows to use the new `Checkbox` component with full-row clickability (`htmlFor`/`onClick`); added auto-save feedback banners and bottom "설정 완료" action buttons with progressive blur background masks.
- `components/settings/SettingsHeader.tsx` — standardized to a 3-column grid (`[40px_1fr_40px]`) with a tactile circular back button and centered title.
- `components/settings/SettingsRow.tsx` — made `icon` prop optional, added `htmlFor` and `onClick` support for accessible label wrapping, and standardized row hover/active states.

### Changed — navigation, staff call, product detail & confirmation flow

- `components/layout/HeaderBar.tsx` — redesigned to a 3-column grid (`grid-cols-[40px_1fr_40px]`) with a top-left circular back navigation link, centered store title and table/takeout badge, and balanced right spacer (removing redundant top-right settings icon).
- `components/flow/StaffCallButton.tsx` — redesigned modal into a dedicated two-step bottom drawer: an idle confirmation step ("직원을 호출할까요?", table badge, side-by-side cancel/call buttons) and a success completion step (animated Toss celebration checkmark, green table badge, "호출이 완료되었어요!" title, single "확인" dismiss button).
- `components/flow/ProductDetailSheet.tsx` — added overlaid circular back button directly over the hero image stage; moved "필수" badges directly beside option group titles; eliminated redundant "(1개 선택)" and "추가금 없음" text; added `maxSelections` limit enforcement with accessible toast notifications; converted bottom action bar to a fixed progressive blur bar with `RollingPrice`.
- `components/flow/FeaturedMenuSection.tsx` — updated badge copy from "BEST" to "인기 메뉴" with numbered ranking tags (1, 2, 3위) and simplified accessible announcement labels.
- `components/flow/ConfirmationStep.tsx` — expanded layout to full height, enlarged hero order number display (4xl/5xl font size), polished receipt card, and made the bottom "새로운 주문하기" CTA sticky with session state reset.
- `components/ui/drawer.tsx` — added `overscroll-contain` and `data-lenis-prevent=""` to drawer overlay and content containers, and wired a grab-friendly `DrawerHandle`.
- `app/providers.tsx` — configured `ReactLenis` with `allowNestedScroll: true` and `autoToggle: true` to prevent scroll collisions inside drawers.
- `store/useCartStore.ts` — added `showToast` convenience method; updated `updateQuantity` so reducing quantity to 0 triggers `removeItem`; updated `resetOrder` to clear `storeInfo`.
- `lib/types/menu.ts`, `lib/data/menu.json` — added `maxSelections?: number` support to `ProductOptionGroup`.
- `next.config.ts` — added `devIndicators: false`.
- `tests/unit/components.test.tsx` — added comprehensive tests covering HeaderBar back navigation, StaffCallButton 2-step drawer flow, ProductDetailSheet overlaid back button & maxSelections validation, and OrderTypeSelectView / TableSelectView rendering.

### Removed — UX audit: unused menu category

- `lib/data/menu.json` — dropped the `브런치` (brunch) category and its sole item (`avocado-brunch-plate`); nothing in the catalog referenced the category after this pass, so it was dead data, not a live menu section.
- `lib/types/menu.ts` — removed the now-dangling `"brunch"` literal from `ProductCategory`; the union already carries `(string & {})` for forward compatibility, so this only removes a literal nothing produces anymore, not real type coverage.

### Fixed — UX audit: duplicate focus rings, category search, scroll-spy flicker, invalid radius

- `components/ui/button.tsx`, `components/ui/checkbox.tsx`, `components/ui/switch.tsx`, `components/flow/ProductCard.tsx`, `components/flow/SelectionCard.tsx`, `components/flow/MenuCategoryHeader.tsx`, `components/flow/MenuSearchSection.tsx`, `components/flow/FeaturedMenuSection.tsx`, `components/settings/SettingsRow.tsx` — removed `outline-none` + a low-contrast `ring-*`/`ring-ring/50` pairing that had quietly become the *only* focus indicator on these components (computing to ~2.17:1, below WCAG 1.4.11's 3:1 non-text floor). All now fall back to the global 2px Toss Blue `:focus-visible` outline (`app/globals.css`, 4.92:1) instead of shipping a second, weaker ring per component. See DESIGN.md's "every focusable element gets the same ring" rule.
- `components/flow/InvalidOrderLinkNotice.tsx` — `rounded-[--radius-md]` compiled to the literal invalid CSS `border-radius: --radius-md` (Tailwind v4 arbitrary-value syntax needs `var(--radius-md)` or a raw px value), silently rendering the CTA link with square corners; replaced with `rounded-[14px]`.
- `components/flow/MenuCategoryHeader.tsx` — added an `id="menu-category-header"` anchor on the sticky category strip so its real rendered height can be measured live instead of guessed; the scroll-spy logic that consumes this anchor lands in the next commit alongside `MenuClientView.tsx`.
- `components/flow/MenuSearchSection.tsx` — category search matched `product.category` (the English id, e.g. `"coffee"`) against the user's Korean query, so searching "커피" returned zero results; now matches against the category's `labelKo` via an id→label map.
- `components/flow/FeaturedMenuSection.tsx` — `scroll-mt-[64px]` → `scroll-mt-[72px]`, matching the sticky category header's real height.

### Fixed — UX audit: cart undo, checkout redirect, mock failures, badge contrast

- `store/useCartStore.ts` — `removeItem`'s undo always restored the item to the *end* of the cart, regardless of where it was removed from; now captures its original index via `findIndex` and re-inserts there.
- `components/flow/ConfirmationStep.tsx` — "새로운 주문하기" read `store.orderType`/`store.table` *after* calling `onReset()`, which had already cleared them, so it always redirected to `/order/{storeId}` (skipping table re-entry for dine-in). Now reads the receipt's store info before resetting.
- `lib/services/OrderService.ts` — `MOCK_FAILURE_RATE` set to `0` (was `0.1`). No real backend/PG exists to fail against yet, so a random failure rate only added unrepeatable friction to demo/QA runs; the failure path stays reachable and testable via `forceFailure`.
- `components/flow/CartSummaryPill.tsx` — the pill returned `null` outright at zero items, tearing its parent `AnimatePresence` down synchronously and skipping the exit animation entirely. Restructured so the component always renders the `AnimatePresence` wrapper and the pill itself is the conditionally-rendered, keyed child, which is what lets Motion animate it out. Also gates `initial` behind `reduceMotion` and drops the now-dead `reserveStaffCallSpace` prop (superseded by `showLabel`, added in the next commit's dynamic bottom-bar work).
- `components/ui/badge.tsx` — `secondary` variant was `bg-primary/10 text-primary` (4.26:1, under the 4.5:1 text floor); replaced with Toss's tinted-blue two-step `bg-secondary text-secondary-foreground` (5.94:1). Several consumers (`ConfirmationStep.tsx` here; `CheckoutSheet.tsx`/`HeaderBar.tsx` in the next commit) had been overriding the variant's color directly via `className`, which masked this and is also removed so the fixed token actually takes effect.

### Added — shared BackButton, SettingsIconButton, QuantityStepper, StoreSelectorList, FontScaleSelector

- `components/ui/BackButton.tsx` — the circular ghost back-navigation button (44px target, spring press-scale, `href`-or-`onClick`) that seven screens/sheets each hand-rolled slightly differently; now a single component so the touch-target size, focus behavior, and press feedback can't drift between them again.
- `components/ui/SettingsIconButton.tsx` — same extraction for the settings gear-icon link, previously duplicated at `40px` (below the 44px floor) in three places.
- `components/flow/QuantityStepper.tsx` — the `[-] N [+]` stepper duplicated across `CartDrawer` and `ProductDetailSheet` with slightly different sizes/labels; now one component with `size="sm"|"md"` and an `itemLabel` for the screen-reader announcement.
- `components/flow/StoreSelectorList.tsx` — the collapsible "직접 매장 선택하기" accordion extracted out of `LandingClientView.tsx` verbatim (behavior unchanged), so that file reads as page composition rather than a mix of page + widget.
- `components/settings/FontScaleSelector.tsx` — the font-scale segmented control extracted out of `app/settings/page.tsx` verbatim.
- `tests/unit/components.test.tsx` — direct render/interaction coverage for all five new components, plus updated `HeaderBar`/`StaffCallButton` cases for the changes below (axe-checked).

### Changed — header nav, staff-call scroll-collapse, dynamic bottom bar, 44px targets

- `components/layout/HeaderBar.tsx` — rebuilt on `BackButton`/`SettingsIconButton`: adds a settings button to the header (previously missing here, present only on other screens — a `PRODUCT.md`/ADR 0003 violation), and fixes the back target for dine-in (was hardcoded to `/order/{storeId}`, skipping the table picker and always landing manually-entered dine-in users back at the order-type screen; now routes to `/order/{storeId}/table`). This is a heuristic — the URL shape can't fully distinguish a QR/NFC entry from manual entry — but it's the closer guess for both paths. The table/takeout badge also gets `aria-hidden` (the `h1`'s `aria-label` already carries the same information as one sentence for screen readers).
- `components/flow/StaffCallButton.tsx`, `components/flow/CartSummaryPill.tsx`, `components/flow/MenuClientView.tsx` — the staff-call button and cart pill now share one dynamic bottom bar that collapses the staff-call button to icon-only (`isExpanded`, driven by scroll direction in `MenuClientView`) and expands the cart pill's label (`showLabel`) to fill the freed space, rather than each managing its own fixed position independently.
- `components/flow/StaffCallButton.tsx` — idle/success status badges recolored onto `bg-secondary`/`bg-success-bg` tokens; the success badge specifically uses `text-foreground` rather than `text-success` as its text color, since `--success` as small text computes to ~2.83:1 (below the 4.5:1 floor) even though it's fine as the large icon fill above it (`app/globals.css` adds `--success`/`--success-bg` tokens documenting this exception).
- `components/flow/OrderTypeSelectView.tsx`, `components/flow/TableSelectView.tsx`, `components/flow/LandingClientView.tsx`, `components/flow/ProductDetailSheet.tsx`, `components/flow/CartDrawer.tsx`, `components/flow/CheckoutSheet.tsx`, `components/flow/QrScannerModal.tsx`, `components/settings/SettingsHeader.tsx`, `app/settings/page.tsx` — swapped their hand-rolled back/settings buttons and quantity steppers for the shared components above (44px touch targets now consistent everywhere instead of only on `HeaderBar`).
- `components/flow/OrderTypeSelectView.tsx` — replaced development placeholder sublabels ("이거" / "넣을까말까") with real copy ("테이블에서 편하게" / "포장 후 픽업").
- `components/flow/MenuClientView.tsx` — the `IntersectionObserver` scroll-spy that consumes `MenuCategoryHeader`'s `#menu-category-header` anchor (added two commits back) lands here: `rootMargin` is measured off the anchor's live height and recalculated on `fontScale` change, picks the highest-`intersectionRatio` entry, and skips redundant state updates — this is what stops short categories from flickering the active tab.

### Added — UX audit plan and session handoff

- `docs/ux-plan-2026-08-17.md` — full UX/accessibility/maintainability audit against `/toss-design`, `/impeccable`, and `DESIGN.md`: whether the current menu-card layout, focus states, and component reuse hold up as production-ready; confirmed decisions on the 16px text floor, card layout, `QrScannerModal`'s wire-up-vs-delete question (held), the language setting (held), and `layout.tsx`'s max-width; a docs-restructure plan; a component-folder reorganization plan; and a file-by-file execution playbook, phases of which are the four commits directly above and are cross-referenced from each.
- `docs/HANDOFF-2026-08-17.md` — session handoff written for continuation by a separate agent instance; superseded in part by this commit sequence actually landing everything through Phase 2 plus the component-extraction work its own "next steps" section still listed as not started — see the four commits above for what's real versus what the handoff still describes as pending.

### Added — toast/feedback architecture (P0)

- `store/useToastStore.ts` — new Zustand store (`toasts`, `pushToast`, `dismissToast`), split out of `useCartStore` since toasts were never cart-specific; having them there meant `/settings` would have had to import the cart store just to show a toast.
- `lib/types/toast.ts` — `ToastItem` moved here from `lib/types/cart.ts`, gaining a `variant?: "cart" | "staff-call" | "delete" | "generic"` field so `A11yToastContainer` can pick an icon without string-matching message text.
- `tests/unit/useToastStore.test.ts` — direct coverage of the new store.

### Fixed — toast/feedback architecture (P0)

- `lib/services/A11yFeedbackService.ts` — the root cause of a P0 bug: `notify()` only *returned* a `ToastItem`, and 6 call sites across `/settings` discarded the return value instead of pushing it anywhere, so screen-reader users got a live-region announcement on every settings toggle while sighted users got no visual confirmation at all. Added `toast(input)` — announces, optionally vibrates, and pushes into `useToastStore` in one call, impossible to accidentally discard. `notify()` stays as a deprecated wrapper around `toast()` so any not-yet-migrated caller now shows a real toast too, with zero code change required of it.
- `components/flow/A11yToastContainer.tsx` — read from `useToastStore` instead of `useCartStore`; icon selection switched from matching substrings in the Korean message text (`.includes("직원")`, `.includes("삭제")`) to `toast.variant`; the undo link's colors (`#3182F6`/`#5299FF`) were ADR 0008's explicitly-rejected legacy brand blue, now `text-primary`/`hover:text-primary/80`; removed a duplicate local `outline-none` on the undo button (relies on the global focus outline now, like everything else this round).
- `app/layout.tsx` — `<A11yToastContainer />` now mounts once here instead of inside `MenuClientView.tsx`, so `/settings` (previously toast-less) and every other route actually render it.
- `store/useCartStore.ts` — `toasts`/`dismissToast`/`showToast` removed entirely (moved to `useToastStore`); `addItem`/`removeItem` call `toast()` directly instead of `notify()` + a manual `set({toasts:...})`. Cart toast copy now includes the product name (`design-system.md`'s required pattern) instead of just a bare count: "아메리카노 1잔이 장바구니에 담겼습니다." / "아메리카노가 장바구니에서 삭제되었습니다."
- `components/flow/StaffCallButton.tsx` — its `notify()` call was followed by a manual `useCartStore.setState({toasts:...})`, bypassing the store's own action entirely; now calls `toast({..., variant: "staff-call"})` directly. Its 3 CTA buttons also had literal hex colors (`bg-[#F2F4F6]`, `bg-[#0064FF]`) instead of `Button` variants — switched to `variant="secondary"`/`variant="default"`.
- `tests/unit/useCartStore.test.ts` — toast-related assertions repointed at `useToastStore` (a matching one-line fix in `tests/unit/components.test.tsx` ships in the menu-card-redesign commit below, alongside that file's other unrelated updates).

### Changed — split SettingsRow into 3 components + barrel

- `components/settings/SettingsRow.tsx` (~207 lines exporting 3 unrelated components) split into `SettingsRow.tsx`, `SettingsCard.tsx`, and `SettingsGroup.tsx`, each now under 80 lines, plus `components/settings/index.ts` barrelling all four settings components (including the pre-existing `SettingsHeader`). `SettingsCard`'s known `trailing ?? <ChevronRight />` footgun (`??` treats `trailing={null}` as nullish too, so it still renders the chevron) is left behaviorally unchanged, just documented in place. `SettingsRow.tsx` also drops a local `outline-none` that duplicated the global focus outline, and `SettingsCard`'s literal `text-[#0064FF]` icon-color default becomes `text-primary`.

### Fixed — remaining literal-hex colors, dead dark: variants, outline-none duplicates, touch targets

- `components/flow/MenuCategoryHeader.tsx` — `bg-[#F2F4F6]`/`hover:bg-[#E5E8EB]` (inactive category pill) → `bg-muted`/`hover:bg-border`.
- `components/ui/checkbox.tsx`, `components/ui/drawer.tsx` — `border-[#D1D6DB]`/`bg-[#D1D6DB]` → `border-input`/`bg-input`.
- `components/ui/badge.tsx` — removed dead `dark:` variants (this app has no dark theme, see `app/globals.css`).
- `components/flow/MenuSearchSection.tsx` — search-clear button's hit area was 28×28px (`h-7 w-7`), below the 44px floor; enlarged the clickable area to `h-11 w-11` while keeping the visible circle the same apparent size via a non-interactive inner span.
- `components/flow/TableSelectView.tsx`, `components/settings/FontScaleSelector.tsx` — removed local `outline-none` duplicating the global focus outline.

### Added — cta-full button size, StickyActionBar, formatKRW helper

- `components/ui/button.tsx` — new `size="cta-full"` (`h-14 w-full ... rounded-[16px]`) replacing an 8-call-site pattern where every CTA button restated `size="lg"`'s own values in its `className` — noise that also meant changing the design system's own button size later wouldn't have propagated anywhere. `default` variant's `shadow-none` replaced with the blue-tinted glow `DESIGN.md` specifies (`shadow-[0_4px_16px_rgba(0,100,255,0.28)]`), which the code had drifted from.
- `components/shared/StickyActionBar.tsx` — the sticky-bottom-action-bar wrapper (gradient fade, safe-area padding, mask-image, backdrop-blur) duplicated near-identically across `ProductDetailSheet`/`CartDrawer`/`CheckoutSheet`/`ConfirmationStep`/the 3 settings pages, with small inconsistent drifts (`z-30` vs `z-40`, `absolute` vs `fixed` vs `sticky`, differing padding) — now one component with a `position: "fixed" | "absolute"` prop. First file in a new `components/shared/` folder (hand-authored, reused widgets — distinct from `components/ui/`, which stays shadcn-codegen-only).
- `lib/format.ts` — `formatKRW(amount)` replacing an ad hoc `` `${n.toLocaleString("ko-KR")}원` `` pattern repeated across the checkout/cart flow.
- `components/flow/ProductDetailSheet.tsx`, `components/flow/CartDrawer.tsx`, `components/flow/CheckoutSheet.tsx`, `components/flow/ConfirmationStep.tsx` — all four switched to `StickyActionBar` + `size="cta-full"` + `formatKRW`. `ConfirmationStep`'s bar previously did double duty as both the receipt's entrance-animation element and the position wrapper (a `motion.div` with `sticky`/`z-20`/`pt-3`, itself one of the drifts); the animation now wraps just the button inside `StickyActionBar` instead of the fixed-position element itself, since animating `transform` on a `position: fixed` element would silently break its positioning by making it a new containing block. Also removed a leftover `dark:border-white/10` from `ProductDetailSheet`'s hero image container, and swapped its max-selection error notice from the now-removed `useCartStore.showToast` (see the toast-architecture commit above) to the new `toast()` API directly.

### Changed — wire the above into the 3 settings pages

- `app/settings/page.tsx`, `app/settings/accessibility/page.tsx`, `app/settings/payment/page.tsx` — switched to the `@/components/settings` barrel import; every `notify()` call except one migrated to `toast()` (same message text); reset button's literal `#F04452`/`#FEEBE8` → `bg-destructive/10 border-destructive/20 text-destructive` (3.23:1 → passes 4.5:1); the accessibility/payment info boxes' `#E8F3FF`/`#0064FF` → `bg-secondary border-primary/15`; payment's checkbox `#D1D6DB` → `border-input`; bottom CTAs switched to `StickyActionBar` + `size="cta-full"`.
- `app/settings/page.tsx`'s `handleComplete` called `notify()` immediately followed by `router.back()`, unmounting the page before the screen-reader announcement finished being read. Now waits ~250ms before navigating.
- The one call left on the deprecated `notify()`: the language (ko/en) picker's confirmation toast. That feature is frozen this round by product decision — its text, trigger, behavior, and even this API call are deliberately untouched; it keeps working via the deprecated wrapper.

### Changed — menu card redesign: photo above a solid panel, not overlaid on it (the core of this UX audit)

- `components/flow/ProductCard.tsx` — rebuilt. The prior card overlaid the product name/price on a semi-transparent glass panel sitting directly on top of a food photo, which meant text-on-photo contrast could never be guaranteed regardless of color choice — a photo can be any brightness at any point. Now the photo sits in its own fixed-`aspect-[4/3]` area and the name/price render in a solid `bg-card`/`text-card-foreground` panel below it — real design tokens instead of a `product.themeBg` inline style and literal `text-[#191F28]`, and no more `line-clamp-2` truncating long Korean names now that the panel can grow. Sold-out items switched from `disabled` (which removes them from the tab order entirely, so screen-reader users didn't know they existed) to `aria-disabled` + a no-op click handler, and the `opacity-60`/grayscale treatment now applies to only the photo, not the whole card including its own sold-out badge (which previously had its contrast dropped along with everything else). Accessible names now prefer `product.voiceDescriptionKo` (18 items had this field, unused anywhere until now) over the terse "name, price" pattern. New `layout?: "grid" | "row" | "carousel"` prop: `row` is a compact list layout (small square thumbnail + wide text area) that Menu​ClientView switches to at `fontScale >= 1.15`, since a 2-column grid doesn't leave enough width for long product names at large text sizes; `carousel` is the featured-section sizing and can show a numbered rank chip via a new `rank` prop, with the rank folded into the accessible name too (e.g. ", 인기 1위 메뉴") so screen-reader users get the same context the visual badge gives sighted users.
- `components/flow/FeaturedMenuSection.tsx` — shrunk from ~125 to ~75 lines by deleting its own near-duplicate of `ProductCard`'s old markup and rendering `<ProductCard layout="carousel" rank={i+1} />` instead; the featured carousel now also shows the sold-out badge/graying it never had before, since `ProductCard` is the one place that logic lives now. Its item selection also changed from `products.slice(0, 4)` (literally whichever 4 items happened to sit first in the catalog) to filtering by the new `popularityRank` field — the old slice put Americano/Latte/Vanilla-Latte/Decaf-Americano at the top, 3 of which duplicated the coffee category section directly beneath it.
- `lib/types/menu.ts` — `Product` gains `popularityRank?: number` ("absent = not shown in the popular section, 1 is highest").
- `lib/data/menu.json` — seeded `popularityRank` 1–4 on 4 category-diverse products (아메리카노/coffee, 뉴욕 치즈케이크/dessert, 자몽 에이드/beverage, 크로크무슈/food) instead of 3 coffee items.
- `lib/services/MenuService.ts` — new `getPopularProducts(limit=4)`, filtering/sorting by `popularityRank`.
- `components/flow/MenuClientView.tsx` — category grid switches between `grid-cols-2`/`layout="grid"` and `grid-cols-1`/`layout="row"` based on `fontScale >= 1.15`; category sections now separated by a full-width `Separator` (gap increased `gap-8` → `gap-10`) instead of spacing alone, per the "don't box the cards, the sticky category header already does that job for screen readers" call in the underlying audit. Also where `<A11yToastContainer />` used to mount (moved to `app/layout.tsx`, see the toast-architecture commit above).
- `tests/unit/components.test.tsx` — `sampleProduct` fixture gained `popularityRank: 1` (needed once `FeaturedMenuSection` started filtering on it); `ProductCard`'s sold-out assertion updated from `toBeDisabled()` to `toHaveAttribute("aria-disabled", "true")`; its accessible-name assertions updated to expect the full `voiceDescriptionKo` sentence (plus rank suffix in the carousel case) instead of the old terse "name, price" label; one toast-store assertion repointed at `useToastStore` (see the toast-architecture commit above).


