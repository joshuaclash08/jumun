# Tech Stack

This document describes the full technology stack planned for Jumun's Phase 1 web prototype, why each piece was chosen, and how overlapping tools (particularly the three animation libraries) divide responsibility. Nothing in this document is installed yet — see `plan.md` for what "documentation-only round" means. Versions are intentionally not pinned here; record actual resolved versions in this file once real installation happens in a later round, rather than guessing now.

## Core

| Library | Role | Notes |
|---|---|---|
| **Next.js** (App Router) | Framework | Chosen for three reasons: it's shadcn's first-class/default target, it matches legacy's own precedent for this exact product, and it keeps a clean path toward the Phase 2 Expo/React Native port described in `plan.md` (App Router's file-based routing and server/client component split translate reasonably well to Expo Router later). |
| **React** | UI library | Ships with Next.js. |
| **TypeScript** (strict mode) | Language | Strict mode is non-negotiable. Legacy's `next.config.ts` set `typescript: { ignoreBuildErrors: true }`, silently undermining type safety — Jumun does not inherit this; see `docs/architecture.md` for the specific fix. |
| **Tailwind CSS v4** | Utility styling, supplements shadcn | v4's idiom is different from v3: no `tailwind.config.*` file — theming lives in `@theme` blocks of CSS custom properties directly inside `globals.css`, imported via `@import "tailwindcss"`. This is a good fit for Jumun because it means the design tokens in `docs/design-system.md` become the *literal* CSS custom properties both Tailwind and shadcn consume — one source of truth, not two systems that can drift apart. |
| **shadcn** (CLI package name: `shadcn`, not the deprecated `shadcn-ui`) | Main component library | Run via `npx shadcn init`, which auto-detects Next.js App Router + Tailwind v4. **Important and easy to get wrong**: current shadcn lets you choose the underlying primitive layer via `--base <base>` (`base` / `radix` / `aria`) — it does not unconditionally default to Radix. Since this project explicitly requires Radix, pass `--base radix` (or answer the init prompt accordingly) explicitly when scaffolding begins. Don't assume the default satisfies this. |

## Headless primitives & icons

| Library | Role | Notes |
|---|---|---|
| **Radix UI** (Primitives) | Headless, accessible interaction primitives | Arrives two ways: (1) transitively, through shadcn's generated component code once `--base radix` is selected — current shadcn generates imports from the unified `radix-ui` package (e.g. `import { Select as SelectPrimitive } from "radix-ui"`), not the older per-component packages like `@radix-ui/react-select`; (2) directly, for interactions shadcn doesn't ship a recipe for — `Toast`, `VisuallyHidden` (for screen-reader-only text), `Slider`. Radix's whole design philosophy — correct keyboard navigation, correct ARIA state, managed focus — is a direct fit for this project's focus-ring and full-keyboard-navigation requirements, not a redundant second UI kit layered on shadcn. **Disambiguation, worth remembering**: this means Radix *Primitives* specifically. Not "Radix Themes" (a separate pre-styled component kit — would conflict with shadcn's own theming) and not "Radix Icons" (redundant with Lucide, see below — do not add). |
| **Lucide** (`lucide-react`) | Icon set | Already shadcn's assumed default icon set. Zero-friction, zero redundancy pairing. |

## State management

| Library | Role | Notes |
|---|---|---|
| **Zustand** | Global state | Matches legacy's precedent and is RN-portable, which matters for the Phase 2 Expo port. Two stores planned, following legacy's proven shape (see `docs/architecture.md` for the full pattern): a cart store with a toast+undo history stack, and a settings store that persists only merged boolean/numeric accessibility settings — never a raw disability profile, for privacy. |

## Animation — three libraries, one rule, explicit division of labor

Motion (React), GSAP, and Lenis all do "animation" in some sense, which makes them redundant unless responsibilities are explicitly divided. They are:

| Library | Owns | Reasoning |
|---|---|---|
| **Motion** — package `motion`, imported as `import { motion } from "motion/react"` — **not** the `framer-motion` package. Framer Motion rebranded to Motion; `framer-motion` still exists but is the legacy/compatibility name. Legacy's own `package.json` used `framer-motion`, which was correct when it was written and is now the outdated name — verified live against current docs before writing this, not assumed from training data or copied from legacy. | React component/page-transition animation: step-to-step wizard transitions (`AnimatePresence`), micro-interactions tied to component state (button press scale, bottom-sheet open/close, toast enter/exit, cart-item add/remove layout reflow via the `layout` prop) | This is the **default** choice for anything tied to React state or lifecycle. Matches legacy's actual usage pattern already (modulo the package rename above). |
| **GSAP** | Complex, imperative, timeline-based sequences that are awkward to express as React state transitions: the loading-screen intro, the order-success reveal choreography, any future scroll-scrubbed effect via ScrollTrigger | The **exception**, reached for only when Motion's declarative model gets awkward — precise multi-node staggered sequencing, for example. Legacy's loading-screen technique (`yPercent: -100` slide-off on completion) is worth keeping verbatim as a GSAP pattern. |
| **Lenis** | Smooth-scroll momentum on the menu-list scroll container only | A "feel" layer under both of the above, not a replacement for either. |

**Rule that applies to all three, without exception:** every animation must collapse to instant/off when the app's `reduceMotion` setting is true — Motion transitions drop to `duration: 0`, GSAP timelines are skipped or seeked straight to their end state, and `<ReactLenis>` (the current official `lenis/react` integration) is not instantiated at all. This generalizes legacy's own CSS-level reduced-motion override (confirmed in `legacy-reference/app/globals.css`, forcing all animation/transition durations to `0.01ms` under `prefers-reduced-motion: reduce`) up to the JS animation layer too.

**Lenis-specific caveat worth remembering**: Lenis's own defaults auto-detect the OS-level `prefers-reduced-motion` and switch to instant/1:1 scrolling on their own. That's not sufficient here, because Jumun's accessibility settings store is meant to be the single source of truth for `reduceMotion` — seeded from the OS preference, but independently overridable by the user in the in-app settings panel. So: gate `<ReactLenis>` behind the app's own store value, not Lenis's built-in OS check alone. Also, smooth-scroll hijacking is a known anti-pattern for screen-reader/switch-control users, whose navigation is focus-driven rather than scroll-driven — a programmatic `focus()`-triggered scroll (e.g., "focus jumped to the next field") should never be smoothed by Lenis.

## Typography

| Choice | Notes |
|---|---|
| **Pretendard** (primary) + **Noto Sans KR** (CJK-coverage fallback), loaded via `next/font` | `next/font/local` for Pretendard's static/variable `.woff2` files, `next/font/google` for Noto Sans KR. This is a concrete improvement over legacy, not just a style preference: legacy loaded Pretendard from an external jsdelivr CDN via a CSS `@import` at the top of `globals.css`, which is a render-blocking network request with no `font-display`/preload control. Self-hosting via `next/font` avoids that entirely. |
| Fallback stack | `-apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", sans-serif` — kept from legacy's own fallback choice as the final safety net if both primary fonts fail to load. |

## Testing

| Library | Role |
|---|---|
| **Vitest** | Unit + component test runner. Matches legacy's precedent, pairs natively with Vite-family tooling and Next.js. |
| **@testing-library/react** | Component tests queried by role/accessible name — see `docs/testing-strategy.md` for why this matters more than usual here (a passing test that used a `data-testid` proves nothing about screen-reader usability). |
| **@axe-core/react** (or `vitest-axe`) | Automated accessibility violation checks, run as part of the component-test suite, treated as build-breaking per `docs/testing-strategy.md`. |

Full testing approach, including what's deliberately deferred, in `docs/testing-strategy.md`.

## Package manager & deployment

| Choice | Confidence | Notes |
|---|---|---|
| **Bun** | Recommended default | Legacy's own `docs/architecture.md` explicitly specified "Bun 1.3+," even though the legacy repo itself shipped both `bun.lock` and `package-lock.json` (an unresolved ambiguity there). Jumun picks one explicitly: Bun. Plain `npm` is the documented fallback if Bun isn't available in a given environment. |
| **Cloudflare Workers**, via `@opennextjs/cloudflare` + `wrangler` | Lower-confidence, inferred only | Matches legacy's actual (internally consistent, working) deployment configuration — `wrangler.jsonc` + `open-next.config.ts` + the `opennextjs-cloudflare build`/`deploy` scripts. Legacy's README mentions Vercel, but that's unedited `create-next-app` boilerplate, not a real decision. Flagged as lower-confidence than everything else in this document specifically because hosting wasn't part of this project's explicit requirements — revisit if there's a reason to prefer something else. |

## Explicitly considered and rejected

Kept out deliberately, to avoid installing anything that doesn't earn its place yet:

| Candidate | Verdict | Why |
|---|---|---|
| React Hook Form + Zod | Not now | Phase 1 only needs one or two real inputs (manual table-number entry, maybe a special-request field) — plain controlled state plus shadcn's `<Input>` covers it. shadcn's own `<Form>` component is itself an RHF+Zod wrapper, so adding this later (if checkout ever needs real validated fields) requires no rework of what's built now. |
| date-fns / dayjs / luxon | Not needed | The only plausible use is formatting an order timestamp; native `Intl.DateTimeFormat` / `toLocaleString('ko-KR', ...)` covers it without a dependency. |
| TanStack Query | Not now | There's no real backend yet in Phase 1 — `OrderService.submitOrder` is a mocked `Promise` with artificial latency (a pattern worth keeping conceptually from legacy). Add TanStack Query when a real API exists, which `plan.md` already frames as a Phase 2+ concern. |
| Radix Icons | Rejected | Redundant with Lucide — would duplicate an already-solved need. |
| A second "photophobia" dark theme (legacy had one, separate from the AAA/high-contrast mode) | Deferred, not rejected outright | `docs/design-system.md` only specifies a default theme plus an AAA/high-contrast mode per this project's actual spec. A third theme mode now would be scope creep beyond what was asked; worth reconsidering as a future toggle, not committed here. |
