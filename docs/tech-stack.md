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

## Animation — two libraries, one rule, explicit division of labor

**As of `docs/decisions/0009-motion-only-animation.md`, GSAP and `@gsap/react` have been removed.** They were used in exactly one place — `ConfirmationStep.tsx`'s receipt-reveal stagger — and that turned out to be fully expressible with Motion's own `variants`/`staggerChildren` API, which also let the confirmation moment get a distinct, more celebratory spring-pop on the success icon (content-appropriate motion, not the same recipe reused everywhere) instead of the flatter, uniform GSAP timeline it had before. Motion (React) and Lenis remain, with responsibilities divided as:

| Library | Owns | Reasoning |
|---|---|---|
| **Motion** — package `motion`, imported as `import { motion } from "motion/react"` — **not** the `framer-motion` package. Framer Motion rebranded to Motion; `framer-motion` still exists but is the legacy/compatibility name. | Every declarative and imperative animation in the app now: step-to-step wizard transitions (`AnimatePresence`), micro-interactions tied to component state (button press scale, bottom-sheet open/close, toast enter/exit, cart-item add/remove layout reflow via the `layout` prop), *and* the multi-node staggered/celebratory sequences that used to be GSAP's exception case, via `variants` + `staggerChildren`/`delayChildren`. | The **only** UI animation library now. Reduced-motion handling, bundle size, and the "physics language" (spring `stiffness`/`damping`) are all single-sourced instead of split across two APIs that each needed their own reduced-motion wiring. |
| **Lenis** | Smooth-scroll momentum on the menu-list scroll container only | A "feel" layer under Motion, not a replacement for it — scroll physics and component/state animation are different enough problems that a dedicated scroll library still earns its place; Motion doesn't have a first-class momentum-scroll primitive. |

**Rule that applies to both, without exception:** every animation must collapse to instant/off when the app's `reduceMotion` setting is true — Motion transitions drop to `duration: 0` (or skip their `variants` entirely, as in `ConfirmationStep.tsx`), and `<ReactLenis>` (the current official `lenis/react` integration) is not instantiated at all. This generalizes legacy's own CSS-level reduced-motion override (confirmed in `legacy-reference/app/globals.css`, forcing all animation/transition durations to `0.01ms` under `prefers-reduced-motion: reduce`) up to the JS animation layer too.

**Lenis-specific caveat worth remembering**: Lenis's own defaults auto-detect the OS-level `prefers-reduced-motion` and switch to instant/1:1 scrolling on their own. That's not sufficient here, because Jumun's accessibility settings store is meant to be the single source of truth for `reduceMotion` — seeded from the OS preference, but independently overridable by the user in the in-app settings panel. So: gate `<ReactLenis>` behind the app's own store value, not Lenis's built-in OS check alone. Also, smooth-scroll hijacking is a known anti-pattern for screen-reader/switch-control users, whose navigation is focus-driven rather than scroll-driven — a programmatic `focus()`-triggered scroll (e.g., "focus jumped to the next field") should never be smoothed by Lenis.

## Typography

| Choice | Notes |
|---|---|
| **Pretendard** (primary) + **Noto Sans KR** (CJK-coverage fallback), loaded via `next/font` | `next/font/local` for Pretendard's static/variable `.woff2` file, `next/font/google` for Noto Sans KR. This is a concrete improvement over legacy, not just a style preference: legacy loaded Pretendard from an external jsdelivr CDN via a CSS `@import` at the top of `globals.css`, which is a render-blocking network request with no `font-display`/preload control. Self-hosting via `next/font` avoids that entirely. |
| Exact sourcing (verified live, not assumed) | Self-hosted from `public/fonts/PretendardVariable.woff2` — the official Pretendard 1.3.9 release distribution, copied in directly rather than resolved through the `pretendard` npm package (removed; was `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`, byte-identical to the file now in `public/fonts/`, verified via md5 before switching). Point `next/font/local` at `../public/fonts/PretendardVariable.woff2` with `variable: '--font-pretendard'`. **Required, easy to miss**: pass an explicit `weight: '45 920'` (the variable font's real weight range) — omitting it renders the wrong weight specifically in WebKit/Safari, which matters here because iOS Safari is an explicit target browser for this product (see the Vibration API constraint in `plan.md`). |
| Fallback stack | `-apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", sans-serif` — kept from legacy's own fallback choice as the final safety net if both primary fonts fail to load. |

## Korean Language & Utility Ecosystem

| Library | Role | Notes |
|---|---|---|
| **`es-hangul`** | Korean NLP & Search | Handles Hangul particle affixing (조사 처리: `이/가`, `을/를`) for accessible screen-reader sentences and dynamic toast messages, as well as initial consonant search (초성 검색: "ㅇㅁㄹㅋㄴ" → "아메리카노"). |
| **`es-toolkit`** (unscoped — **not** `@toss/es-toolkit`, which doesn't exist on npm; corrected during install, verified live) | Utility functions | Modern, 2-3x-faster, up-to-97%-smaller lodash alternative, maintained by Toss/Viva Republica under the `toss` GitHub org but published unscoped. Used for array/object manipulation and debounce utilities (touch debounce for motor accessibility). |

**Language switching (ko/en) — no i18n framework.** The settings language toggle (`docs/features.md`) is served by a small static dictionary object plus a `useTranslation` hook (conceptually kept from legacy's own hook of the same name), not `next-intl`/`next-i18next`/a routed-locale setup. Phase 1 has no locale-specific routing, SEO, or pluralization-rule complexity to justify a framework — two flat string maps and a store-driven lookup is the whole requirement. Revisit only if a real i18n framework's other features (locale-aware routing, ICU pluralization) become genuinely needed, not preemptively.

## Design Systems: Toss TDS vs. Shadcn UI + Radix

Full reasoning recorded as [ADR 0005](decisions/0005-toss-tds-vs-shadcn.md); summarized here for stack-reference convenience.

| Candidate | Verdict | Why & Strategy |
|---|---|---|
| **`@toss/tds-mobile` / `@emotion/react`** | Evaluated & rejected | `@toss/tds-mobile` relies on `@emotion/react` and React 17/18. In Next.js 16 (App Router) + React 19, Emotion suffers from CSS-in-JS style injection bugs and React Server Components incompatibilities. Furthermore, TDS Mobile components are pre-compiled for Toss internal App-in-Toss (AIT) environments, making customized accessibility tokens (WCAG AAA contrast palette, safe-area tokens) difficult to override. |
| **shadcn (`--base radix`) + Toss-inspired token layer** | **Chosen strategy** | The **clean, tactile feel** (large corner radii, generous 56–64px touch targets, subtle active-press springs, fluid bottom sheets — formalized in `DESIGN.md`'s Shapes/Components sections) is achieved on top of **shadcn + Radix Primitives + Tailwind v4 + Motion**, as design tokens this project owns, not as inherited component code. Full React 19 compatibility, zero Emotion runtime overhead, and every accessibility token stays overridable. |

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
| **Cloudflare Workers**, via `@opennextjs/cloudflare` + `wrangler` | Lower-confidence, inferred only | Matches legacy's actual (internally consistent, working) deployment configuration — `wrangler.jsonc` + `open-next.config.ts` + the `opennextjs-cloudflare build`/`deploy` scripts. Legacy's README mentions Vercel, but that's unedited `create-next-app` boilerplate, not a real decision. Flagged as lower-confidence than everything else in this document specifically because hosting wasn't part of this project's explicit requirements — revisit if there's a reason to prefer something else. **Live, current compatibility risk, verified before writing this**: Next.js 16 renamed `middleware.ts` to `proxy.ts` (the exported function changed from `middleware()` to `proxy()`) as part of a new proxy architecture. `@opennextjs/cloudflare` officially lists Next.js 16 as supported, but its current Wrangler-facing build logic still targets the old `middleware` convention, and proxy handlers can fail to build under Next 16 as a result (tracked upstream: [cloudflare/workers-sdk#13755](https://github.com/cloudflare/workers-sdk/issues/13755), [#13937](https://github.com/cloudflare/workers-sdk/issues/13937)). Not a blocker for Phase 1 foundation work — nothing in `docs/architecture.md`'s thin route inventory needs middleware/proxy logic yet — but re-check this specific issue's status before adding any `proxy.ts` (auth gate, redirect, header rewrite) or before running a real `opennextjs-cloudflare build` for deployment. |

## Explicitly considered and rejected

Kept out deliberately, to avoid installing anything that doesn't earn its place yet:

| Candidate | Verdict | Why |
|---|---|---|
| React Hook Form + Zod | Not now | Phase 1 only needs one or two real inputs (manual table-number entry, maybe a special-request field) — plain controlled state plus shadcn's `<Input>` covers it. shadcn's own `<Form>` component is itself an RHF+Zod wrapper, so adding this later (if checkout ever needs real validated fields) requires no rework of what's built now. |
| date-fns / dayjs / luxon | Not needed | The only plausible use is formatting an order timestamp; native `Intl.DateTimeFormat` / `toLocaleString('ko-KR', ...)` covers it without a dependency. |
| TanStack Query | Not now | There's no real backend yet in Phase 1 — `OrderService.submitOrder` is a mocked `Promise` with artificial latency (a pattern worth keeping conceptually from legacy). Add TanStack Query when a real API exists, which `plan.md` already frames as a Phase 2+ concern. |
| Radix Icons | Rejected | Redundant with Lucide — would duplicate an already-solved need. |
| A second "photophobia" dark theme (legacy had one, separate from the AAA/high-contrast mode) | Deferred, not rejected outright | `docs/design-system.md` only specifies a default theme plus an AAA/high-contrast mode per this project's actual spec. A third theme mode now would be scope creep beyond what was asked; worth reconsidering as a future toggle, not committed here. |
