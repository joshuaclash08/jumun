# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4 + shadcn (`--base radix`) + Radix UI Primitives + Lucide icons + Zustand + Motion (formerly Framer Motion; package `motion`) + Lenis + self-hosted Pretendard (`public/fonts/`)/Noto Sans KR via `next/font`. Bun package manager. Cloudflare Workers (via OpenNext + wrangler) deployment. Confirmed explicitly across this project's planning sessions, not delegated. Full rationale in `docs/tech-stack.md`. (GSAP was evaluated and used briefly, then removed in favor of a Motion-only animation layer — `docs/decisions/0009-motion-only-animation.md`.)

## Users

General public dining at participating venues — anyone with a smartphone, not a disability-specific audience. The accessibility baseline (WCAG 2.2 AA+ contrast, 44px+ touch targets, full screen-reader support) applies to every user by default, so the product never distinguishes "accessibility users" from "everyone else." No user is ever asked to self-categorize by disability before ordering.

## Product Purpose

Let a person scan a QR/NFC tag at their table with their own phone and independently browse a menu, order, and pay — replacing physical self-order kiosks that are frequently unusable for blind/low-vision, hearing-impaired, mobility-impaired, and elderly users. Food ordering (a fictional cafe menu, see Evidence on Hand) is the Phase 1 proof of concept for a broader pattern; see Product Principles.

## Positioning

Instant, accessible ordering via the user's own phone — no app install required, no shared kiosk hardware ever, no disability-disclosure gate before ordering. Accessibility (contrast, touch targets, focus rings, no time pressure, thorough screen-reader support) is the default experience for everyone, not a special mode layered on top.

A single physical tag at the table carries both a printed QR code and an NFC chip — scanning or tapping either leads to the same instant, no-install experience, and automatically restores the user's previously saved accessibility settings alongside the current table/venue context.

A native app version is a separate, confirmed near-term companion surface, not a future replacement for this one. The web version is not a pre-install fallback — it remains a permanent, fully-supported channel for people who prefer not to install anything, even after the native app ships.

## Operating Context

- Each session begins with a QR/NFC tag scan at a physical table (dine-in) — the tag encodes store + table identity.
- One person, one phone, one independently-paced session — never a shared or mounted device.
- Accessibility settings persist per-device across every venue and every session, not reset per-restaurant — a user's contrast/font/motion/language preferences from a previous Jumun order carry forward automatically the next time they scan any Jumun tag anywhere.
- A companion native app is planned; this web surface is Phase 1 of that broader rollout but remains permanently supported in parallel, not deprecated once native ships.

## Capabilities and Constraints

Phase 1 (this build): menu browsing, cart, mocked checkout, order confirmation, a reachable-anytime accessibility settings panel, full native screen-reader support. Explicitly out of scope for Phase 1: voice ordering (STT), custom auto-TTS narration, real payment processing, real backend/persistence, any native-only hardware API, tablet/desktop layouts. See `plan.md` for the full phased roadmap and `docs/decisions/` for the reasoning behind each boundary.

Known web-platform constraint: iOS Safari has no Vibration API at all — haptic feedback must stay supplementary (never load-bearing) until a native app exists.

Undecided: exact rollout timeline for the native app; which service verticals beyond food ordering get built first if the platform generalizes (flight tickets and cinema were both mentioned as examples, not commitments).

## Brand Commitments

Name: Jumun (주문 — Korean for "order"). No logo, wordmark, or other visual asset exists yet — confirmed nothing pre-existing; the visual identity is being designed fresh (see `DESIGN.md`).

## Evidence on Hand

None. No real menu photography, no existing brand assets, no confirmed real venue partnerships at this stage. The Phase 1 menu is explicitly fictional (see `docs/decisions/0002-menu-domain.md`) — future work must not fabricate real testimonials, real venue names, or real pricing data as if they were confirmed facts.

A prior, partially-built attempt at this product (`legacy-reference/`, not tracked in this repo's git history) exists locally and is treated as anti-reference evidence — useful for identifying what not to repeat (see `docs/decisions/*.md`), not as approved visual or product truth.

## Product Principles

1. **Accessible is the only mode.** The full accessibility baseline applies to every user by default; nothing about the interface signals "this is the accessible version."
2. **No install, no hardware, no gate.** A scan or tap is the entire entry cost — never a kiosk device, an app-store detour, or a disability-disclosure step between the user and the task.
3. **The pattern generalizes.** Food ordering is the first proof of a QR/NFC-triggered, accessibility-default transaction pattern meant to extend to other service verticals over time. Phase 1 stays concretely food-scoped, but shouldn't be designed in a way that's needlessly hard to generalize later.
4. **Web is a permanent citizen, not a placeholder.** This surface stays fully supported after a native app ships — it is not disposable scaffolding.

## Accessibility & Inclusion

WCAG 2.2 AA is the enforced floor for default-mode contrast (4.5:1 body text minimum), and AAA (7:1) is the enforced floor once the user opts into high-contrast mode. See `docs/design-system.md` for the exact computed values, which exceed both floors by design (default theme lands at ~15:1, high-contrast mode at ~17:1) for reduced eye strain, not merely to clear the minimum.

Every interactive component is meant to carry deliberately authored screen-reader content — a full descriptive label/description, not just its visible text — as a first-class design requirement, not an afterthought. Full detail in `docs/design-system.md` and `docs/decisions/0001-onboarding-model.md`.
