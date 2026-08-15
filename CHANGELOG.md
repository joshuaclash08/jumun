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

### Changed

Nothing yet — this is the first documentation round for a new project.

### Removed

Nothing yet.

### Fixed

Nothing yet — see `docs/architecture.md` for regressions identified in `legacy-reference/` that this project's plan deliberately does not inherit (disabled pinch-zoom, silenced TypeScript build errors, a dead-end onboarding button, a countdown-timer inactivity warning, real third-party trademarked content in mock data). These aren't "fixes" in this project's own history since the buggy code was never part of this repo — they're documented as decisions not to repeat them.
