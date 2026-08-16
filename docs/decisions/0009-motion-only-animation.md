# 0009 — Consolidate animation onto Motion; remove GSAP

**Status:** Accepted

## Context

`docs/tech-stack.md` originally split UI animation across three libraries: Motion for declarative, state-driven component animation; GSAP (+ `@gsap/react`'s `useGSAP`) for "complex, imperative, timeline-based sequences that are awkward to express as React state transitions"; and Lenis for scroll momentum. In practice, GSAP's actual footprint in the shipped app narrowed to exactly one call site: `components/flow/ConfirmationStep.tsx`'s order-success screen, where a `useGSAP` timeline drove a staggered fade-and-rise reveal (`gsap.from(".receipt-element", {...stagger: 0.08})`) alongside a `canvas-confetti` burst.

Asked directly whether the app could run on a single animation library and be *more* fluid for it, not just simpler: the GSAP call site's actual requirement — stagger a handful of sibling elements in with a fade+rise, one of them (the success icon) more bouncy than the rest — is precisely what Motion's `variants` + `staggerChildren`/`delayChildren` API is for. Nothing about it needed GSAP's imperative timeline or DOM-class-selector targeting (`".receipt-element"`); it was implemented that way because GSAP was already in the dependency tree from an earlier planning pass, not because Motion couldn't do it.

`canvas-confetti` itself never depended on GSAP — it's a self-contained particle-burst library that owns its own render loop. GSAP was only ever wrapping the *trigger*, not the confetti animation itself.

## Decision

Remove `gsap` and `@gsap/react` entirely. Reimplement `ConfirmationStep.tsx`'s reveal using Motion:
- A parent `motion.div` with a `receiptContainer` variant (`staggerChildren: 0.08, delayChildren: 0.15`) orchestrates the stagger, replacing the GSAP timeline + CSS-class-selector approach.
- Each staggered child gets its own `receiptItem` variant (`opacity`/`y` fade-rise, matching the prior GSAP timing almost exactly — 0.4s, comparable easing) — Motion `variants` propagate down the tree declaratively instead of GSAP querying `.receipt-element` by class.
- The success icon gets a **distinct** `successPop` variant (`scale` 0.5→1, spring `stiffness: 300, damping: 15`) instead of the same fade-rise as the receipt card and CTA — a deliberately more celebratory entrance for the one moment in the product that's meant to feel like a small win, not a neutral state change. This is new: the GSAP version treated every staggered element identically.
- `canvas-confetti`'s trigger moves to a plain `React.useEffect` keyed on `[lastReceipt, reduceMotion]` — no animation-library wrapper needed, since it was never actually being animated *by* GSAP, just called *from* a GSAP-scoped callback.

## Consequences

- Two fewer runtime dependencies (`gsap`, `@gsap/react`), and one less reduced-motion code path to keep in sync — Motion's `initial`/`animate` variant switching now handles every animation in the app, GSAP's separate `if (reduceMotion) return` early-exit pattern is gone.
- The confirmation screen animation is measurably more expressive than before (a distinct celebratory beat on the success icon), not just architecturally simpler — directly answering "can consolidating also make it more fluid" with yes for this call site.
- `docs/tech-stack.md`'s animation-library table, `docs/animation-guide.md`'s library-role table and confirmation-step recipe, `docs/features.md`'s per-screen motion notes, `DESIGN.md`, `docs/design-system.md`, and `PRODUCT.md`'s stack summary were all updated to stop citing GSAP as a current dependency — it remains cited in `CHANGELOG.md`'s historical entries and `docs/decisions/0004-voice-scope.md`'s incidental library list unmodified, since those are point-in-time records rather than living specs.
- If a future screen genuinely needs GSAP-caliber timeline sequencing (e.g. a `ScrollTrigger`-driven scroll-scrubbed effect Motion has no equivalent for), reintroducing it is a new decision to make then, not a default to fall back to — Motion's `variants` system should be the first thing reached for.

## Alternatives considered

- **Keep both, just because the split was "correct in principle."** Rejected — a division-of-responsibility rule only earns its complexity cost if the responsibilities are actually distinct in practice. Here they collapsed to the same problem (a staggered reveal), and keeping GSAP around for a single, fully-Motion-expressible call site was paying its bundle/mental-overhead cost for nothing.
- **Move the confetti trigger into Motion's `onAnimationComplete` callback instead of a separate `useEffect`.** Rejected as unnecessary coupling — confetti firing on receipt arrival (not on animation completion) matches the prior GSAP behavior (fired at timeline start, not end) and keeps the celebratory burst decoupled from the reveal animation's own timing, so a future change to one doesn't silently retime the other.
