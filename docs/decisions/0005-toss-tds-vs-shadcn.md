# 0005 — Design system foundation: shadcn + Radix, not Toss TDS Mobile

**Status:** Accepted

## Context

Toss's own mobile design system, `@toss/tds-mobile`, was evaluated as a candidate foundation — a reasonable instinct given the project already adopts other Toss-adjacent tooling (`@toss/es-toolkit` for utilities, `es-hangul` for Korean text processing) and Toss's product design is a widely-cited reference for exactly the "tactile, high-clarity, mobile-native" feel this project wants.

Two concrete incompatibilities rule it out as the actual component foundation, independent of visual taste:

1. `@toss/tds-mobile` depends on `@emotion/react`, targeting React 17/18 usage patterns. This project runs React 19 on Next.js's App Router, where Emotion's CSS-in-JS runtime style injection has known compatibility problems with React Server Components — a foundational architecture mismatch, not a styling preference.
2. TDS Mobile's components are pre-compiled for Toss's internal App-in-Toss (AIT) environment. This project's accessibility requirements are unusually specific and non-negotiable (a computed ≥15:1 default contrast rather than a bare 4.5:1 floor, a 44px touch-target floor with 52–64px CTAs, a two-tier AAA/high-contrast mode) — overriding tokens this deep inside a pre-compiled, externally-governed component library is fighting the tool rather than using it.

This project already committed to shadcn (`--base radix`) + Radix UI Primitives + Tailwind v4 + Motion as the component foundation (`docs/tech-stack.md`) before this evaluation — the real question this decision resolves is whether that foundation should be replaced by TDS Mobile, not whether to consider TDS Mobile from scratch.

## Decision

Keep shadcn (`--base radix`) + Radix UI Primitives + Tailwind v4 + Motion as the component foundation. Achieve Toss's *feel* — large corner radii, generous 56–64px touch targets, subtle active-press springs, fluid bottom sheets — as a design-token and interaction-pattern layer on top of that foundation (see `DESIGN.md`'s Shapes and Components sections), rather than adopting TDS Mobile's actual component code.

## Consequences

- Full React 19 / React Server Components compatibility, with no Emotion runtime overhead.
- Every accessibility token (contrast, touch target, focus ring, AAA mode) stays fully overridable, because it's defined in this project's own `DESIGN.md`/`docs/design-system.md`, not inherited from an external library's defaults.
- The "Toss-like feel" is achieved through deliberate token choices (radius, spacing, press-spring motion) documented and owned by this project, not through a dependency that could change its own defaults independently.
- Slightly more component-building work up front than adopting a pre-built kit would have been — accepted as the correct trade for React 19 compatibility and accessibility-token control, not incurred by accident.

## Alternatives considered

- **`@toss/tds-mobile` + `@emotion/react`, evaluated and adapted.** Rejected — the React 19/RSC incompatibility and the difficulty of overriding accessibility-critical tokens inside a pre-compiled component library are both structural, not stylistic; adapting around them would mean fighting the dependency on every screen rather than benefiting from it.
