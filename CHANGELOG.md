# Changelog

All notable changes to this project are documented in this file, one entry per commit, in the format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This file is a history — entries are appended, never rewritten. For current-state documentation (what the stack/architecture/design system *is* right now, not how it got there), see `plan.md` and `docs/`.

## [Unreleased]

### Added

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

### Changed

- `plan.md` — corrected the Phase 4 framing: the web experience is a permanent, fully-supported channel once the native app ships, not a fallback for people who haven't installed yet. Added the combined QR+NFC physical tag detail and a note on the longer-term multi-vertical platform vision (food ordering is the first proof of concept, not the ceiling). Updated "Current status" from documentation-stage to foundation-stage. Updated the documentation-set table to include `PRODUCT.md`, `DESIGN.md`, and `docs/testing-strategy.md`.
- `docs/design-system.md` — substantially expanded via the impeccable skill's design-calibration principles: a "Visual direction" section stating and justifying the Restrained color strategy and workhorse typography choice for this Operate-mode surface, and explicitly naming which common AI-generated-interface clichés were deliberately avoided; an explicit floor-vs-actual reconciliation for the contrast values (4.5:1/7:1 are enforced floors, ~15:1/~17:1 are where the defaults actually land); new elevation, corner-radius, and button-hierarchy token scales; an imagery-treatment decision (flat illustration, not fake photography, given no real photos exist); loading-state and empty-state patterns; a screen-reader content-authoring section with concrete per-component-type examples; and safe-area-inset handling for the fixed bottom bar.
- `docs/features.md` — added the cross-venue settings-carryover behavior to Entry; per-screen motion choreography (which library owns which transition, and why); a mocked order-failure path with preserved cart state; a new "Error and failure states" section (menu load failure, invalid/expired link, and the accessibility treatment failures get); and receipt content detail on Confirmation.
- `docs/architecture.md` — added a concrete TypeScript data model (Product/CartItem/StoreInfo/OrderReceipt/AccessibilitySettings), full service-layer function signatures with the deliberate null-vs-throw convention for expected failures, safe-area-inset technical handling (`viewport-fit=cover`, `env(safe-area-inset-bottom)`), and an explicit note on why cart/store state and accessibility settings have different persistence scopes.
- `docs/tech-stack.md` — added a Testing section (Vitest, React Testing Library, @axe-core/react); added evaluation of Toss TDS (@toss/tds-mobile) vs Shadcn UI + Radix with Toss design language, and included Toss ecosystem utilities (`@toss/es-toolkit`, `es-hangul`).
- `docs/tech-stack.md` — production-feasibility pass: documented Pretendard's real npm sourcing path and the `weight: '45 920'` requirement (omitting it renders the wrong weight in WebKit/Safari — verified live, and directly relevant since iOS Safari is an explicit target browser); flagged a live, currently-open compatibility risk between Next.js 16's `proxy.ts` rename and `@opennextjs/cloudflare`'s Wrangler-facing build logic (tracked upstream, not a Phase 1 blocker); documented the i18n approach (static dictionary + hook, no framework) so it doesn't get invented ad-hoc later; linked `docs/decisions/0005-toss-tds-vs-shadcn.md` from the Toss TDS comparison table instead of only summarizing inline.
- `docs/architecture.md` — production-feasibility pass: fixed a stale "nothing is scaffolded yet" line; clarified the previously-ambiguous split between root `page.tsx` (manual-entry fallback route) and `/order/[storeId]` (the actual QR/NFC-encoded entry point); added concrete PWA `manifest.json` fields including why `start_url` is the root fallback rather than a specific store route.

### Removed

Nothing yet.

### Fixed

- Corrected "Framer Motion" references to **Motion** (package `motion`, `import { motion } from "motion/react"`) across `docs/tech-stack.md`, `docs/features.md`, `docs/design-system.md`, and `PRODUCT.md` — verified live against current docs before scaffolding: Framer Motion rebranded, and `framer-motion` (what legacy's `package.json` used) is now the outdated/compatibility package name. Caught before installing anything, not after.
- Corrected `@toss/es-toolkit` to **`es-toolkit`** (unscoped) in `docs/tech-stack.md` — the scoped name doesn't exist on npm (404 on `bun add`, not a network issue). The library is real and Toss-maintained, just published unscoped under the `toss` GitHub org. Caught by the install itself failing, fixed immediately rather than left stale in the docs.
- See `docs/architecture.md` for regressions identified in `legacy-reference/` that this project's plan deliberately does not inherit (disabled pinch-zoom, silenced TypeScript build errors, a dead-end onboarding button, a countdown-timer inactivity warning, real third-party trademarked content in mock data). These aren't "fixes" in this project's own history since the buggy code was never part of this repo — they're documented as decisions not to repeat them.
