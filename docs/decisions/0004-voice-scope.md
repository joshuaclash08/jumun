# 0004 — Voice ordering and TTS narration: deferred to Phase 2+

**Status:** Accepted

## Context

Legacy's fuller product vision (`legacy-reference/docs/kiosk_replacement_platform.md`, `plan.md`) treats two voice-related features as headline capabilities:

1. **AI voice ordering** — speech-to-text where a user says something like "아메리카노 1잔 주문해 줘" ("order me one Americano") and the app parses intent and adds the item to cart.
2. **Auto-TTS narration** — the app proactively reads key instructions aloud via the Web Speech API on every screen transition, layered on top of (and distinct from) native screen reader support.

This project's design spec (see `docs/design-system.md`) covers visual, touch, and motor accessibility in detail — contrast, type scale, touch targets, focus rings, motion — and does not mention voice input or output at all. The explicit library list for this project (shadcn, Tailwind, GSAP, Framer Motion, Lenis, Radix UI, Lucide) also contains nothing audio or speech related.

Both voice features are substantial engineering surfaces in their own right: microphone-permission UX, an STT backend choice, intent parsing against the menu, misrecognition/error-state handling for ordering, and a dedicated processing-state UI for voice ordering; narration timing, interruption handling, and voice/rate/language selection for TTS. Neither is a small addition to the Phase 1 scope described in `plan.md`.

## Decision

Voice ordering (STT) and custom auto-TTS narration are out of scope for the Phase 1 prototype. They're recorded in `plan.md`'s roadmap as a Phase 2+ consideration, not deleted from the product vision.

**Native screen reader support (VoiceOver on iOS, TalkBack on Android) stays fully in scope, everywhere, from the start of Phase 1.** This is a distinct thing from custom TTS: it means writing correct semantic HTML and ARIA attributes so the operating system's own, already-installed screen reader works correctly — not building a custom narration system. Legacy itself treated these as two separate systems ("dual speech architecture"); this decision keeps the free/foundational half (correct markup → native screen reader support) and defers the expensive custom half (STT ordering, custom TTS narration).

## Consequences

- Every component built in Phase 1 must still be fully keyboard-navigable and screen-reader-correct (proper roles, labels, live regions for state changes like "added to cart") — this is not weakened by deferring voice features, it's the part that was never optional.
- No microphone permission prompt, no STT backend, no intent-parsing logic, no voice-processing UI in Phase 1 — meaningfully reduces the engineering surface of the initial prototype.
- The product vision isn't narrowed permanently — `plan.md`'s Phase 2+ roadmap keeps voice ordering and TTS narration as a named future direction, to revisit once the core ordering flow and accessibility baseline are proven.

## Alternatives considered

- **Include basic auto-TTS narration only** (skip STT ordering). Considered as a middle ground. Not chosen for Phase 1 — even narration-only adds real scope (timing, interruption, voice/rate settings) beyond what the current design spec asks for, and native screen reader support already covers the core accessibility need without it.
- **Include full voice ordering (STT + TTS)**, matching legacy's original full vision. Not chosen for Phase 1 — disproportionate engineering scope for a docs-first, web-only prototype round; revisit in Phase 2 once native app capabilities (better mic access, on-device STT options) are available anyway.
