# Design System

This document turns Jumun's accessibility specification into concrete, implementable design tokens. It is the single source of truth for color, typography, spacing, focus, and motion — every value here is meant to become a literal CSS custom property in `app/globals.css`'s `@theme` block once implementation starts (see `docs/tech-stack.md` on Tailwind v4's theming approach).

These rules apply to **every user, by default** — see `docs/decisions/0001-onboarding-model.md`. There is no separate "accessible mode" to opt into; this is just how Jumun looks and behaves.

**Toss realignment note (read before trusting any value below against memory):** as of `docs/decisions/0008-toss-visual-realignment.md`, the visual tokens in this document were realigned onto the Toss Design System (`.claude/skills/toss-design`'s merged Figma + brand-guide reference) — new accent hue, radius scale, shadow palette, and card treatment. The six baseline requirements below are unchanged **except rule 5**, which this pass deliberately revises — see its entry for what changed and why. Rules 1–4 and 6 remain enforced exactly as stated; nothing here relaxes a WCAG floor.

## Source specification

The baseline requirements below were specified directly for this project:

1. **Contrast** — minimum 4.5:1 for body text against its background (WCAG 2.2 AA); large text (18pt+/24px+, or 14pt+/bold) may use 3:1. High-contrast mode switches immediately to AAA (7:1).
2. **Touch targets** — minimum 44×44px on every clickable element; primary CTAs recommended at 52–64px. Minimum 8–12px gap between adjacent buttons to prevent mis-taps. Core actions (담기/다음/결제하기) belong in a fixed bottom bar for one-handed, thumb-zone reach.
3. **Focus** — every focusable element gets a minimum 2px, high-contrast visible outline.
4. **No time pressure** — no countdown timers, no "resets in N seconds" banners, anywhere.
5. **Default theme** — ~~a glare-reducing off-white background... explicitly avoiding pure `#FFFFFF`/`#000000`~~. **Revised by the Toss realignment**: this project's actual product spec (`PRODUCT.md`) never mandated avoiding pure white/black — that constraint was this document's own prior interpretation of "serve low-vision/elderly users well," not a literal stakeholder requirement, and grep-checked against `PRODUCT.md`/`plan.md` before being revised here. The default theme is now pure `#FFFFFF` background with `#191F28` near-ink text (16.56:1, still clears AAA with wide margin), matching Toss's own literal spec. What did **not** change: the contrast-ratio floor itself (still 4.5:1 AA / 7:1 AAA, rule 1) and AAA/high-contrast mode still switches to pure `#000000` text for maximum separation. If the glare/afterimage concern resurfaces as an actual user complaint, revisit this specific token — it was a reasoned but non-mandatory choice, not a compliance requirement.
6. **Typography** — readable Gothic-style fonts (Pretendard, Noto Sans KR); base size ≥18px (1.125rem) for body copy, line-height ≥1.5. Letter-spacing shifted from a uniform +0.02em to Toss's tighter, role-specific negative tracking (see Typography below) — Pretendard supports this cleanly at these sizes, and it's Toss's own literal spec, not a deviation from it.

Everything below is these six rules translated into exact values.

## Visual direction

Jumun is an **Operate**-mode surface (a visitor completing a task — ordering — not being persuaded or entertained). In Operate mode, expression never outranks scanability, consistency, and familiar affordances; brand and personality live in precise details, not loud gestures. This shapes every choice below, and is why the direction stays closer to "a very well-made ordering app" than to a portfolio piece.

**Color strategy: Restrained** (neutrals plus one accent) — the default and correct choice for an Operate surface, chosen deliberately rather than by default, and independently Toss's own stated principle for the same reasons. `--color-bg`/`--color-text-primary` carry the whole surface; `--color-accent` ("Toss Blue," `#0064FF`) is spent only on primary actions, links, and selected state — never a whole-region wash. A Committed or Drenched strategy (color owning 30%+ of the surface) would fight legibility and focus precisely where this product can least afford it.

**Typography: workhorse, not display.** Pretendard and Noto Sans KR are system-style UI faces, not faces with a point of view — correct for Operate, where a reader needs speed and neutrality, not a typographic mood. A display serif or an expressive grotesque would be the wrong tool here even before accessibility is considered.

**Explicitly avoided, on purpose:** AI-generated interfaces cluster around a handful of recognizable looks regardless of subject — warm cream ground + high-contrast serif display + terracotta/signal-red accent; near-black + one neon accent with glowing edges; broadsheet-editorial hairlines + italic serif + small tracked mono labels. Jumun's palette (bright white, near-ink text, a single confident blue accent, near-flat elevation, no editorial mono) doesn't land in any of those three — checked deliberately, not by accident, both before and after the Toss realignment. If a future revision of this palette starts resembling one of them, that's a signal to rework it, not a coincidence to ignore.

**What "not AI slop" actually means here**: not decoration — restraint, applied precisely. The bar is: does every screen look like it belongs to a real, shipped, maintained ordering product a person could download today, with the small correct details (real button hierarchy, real loading states, real empty states, safe-area-aware spacing) that generic scaffolds skip. Sections below on elevation, radius, button hierarchy, imagery, and loading/empty states exist specifically to close that gap.

## Color

All contrast ratios are computed via the WCAG relative-luminance formula, not estimated.

**Floor vs. actual, stated explicitly to avoid ambiguity:** 4.5:1 is the enforced *minimum* for default-mode body text — nothing may ever go below it — and 7:1 is the enforced *minimum* once high-contrast mode is on. Body/meta text still lands well past both floors by design (default text ≈16.6:1/7.1:1, high-contrast ≈21:1) — a default theme that only just cleared 4.5:1 would still pass an automated check while looking washed-out, and landing well past it is what makes text feel effortless rather than merely legible. **One deliberate exception**: the Toss Blue accent (`#0064FF`) itself sits at 4.92:1 — comfortably past the 4.5:1 floor but without the wide margin every other token here carries, a direct consequence of adopting Toss's canonical hex exactly rather than a darkened variant (`docs/decisions/0008`). It is still a compliance guarantee everywhere it's used as text, just not landing "well past" the floor the way the rest of the palette does.

### Default theme

Realigned onto the Toss token ramp (`.claude/skills/toss-design/reference/TDS_Toss_Merged_Design_System.md` §0/§2) — see `docs/decisions/0008-toss-visual-realignment.md`. Every ratio below is freshly computed via the WCAG relative-luminance formula against the new `#FFFFFF` background, not carried over from the prior table.

| Token | Hex | Paired against | Ratio | Meets |
|---|---|---|---|---|
| `--color-bg` | `#FFFFFF` (crisp bright white) | — | — | Toss's literal spec — see spec rule 5's revision note above |
| `--color-surface` (cards/elevated content) | `#FFFFFF` | on `--color-bg` | — | No longer a visible color-shift — Toss cards are white-on-white; the boundary reads via a 1px `--color-border-subtle` border **and** `--elevation-1`'s shadow together (**Border-and-Shadow Rule**, supersedes the prior Never-Alone color-shift version of this rule). Text on it clears the same ratios as `--color-bg` below, since it *is* `--color-bg` |
| `--color-text-primary` (near-ink) | `#191F28` | on `--color-bg` | **16.56:1** | Clears AA (4.5:1) and AAA (7:1) floors |
| `--color-text-secondary` (muted slate) | `#4E5968` | on `--color-bg` | **7.12:1** | AA (4.5:1) and AAA (7:1) with wide margin |
| `--color-border-subtle` (decorative dividers, card borders) | `#E5E8EB` | on `--color-bg` | 1.24:1 | Decorative/structural only — never the sole indicator of an interactive boundary |
| `--color-border-strong` (input/interactive boundaries) | `#D1D6DB` | on `--color-bg` | 1.62:1 | Clears WCAG 1.4.11's non-text 3:1 requirement when paired with the 2px focus ring on interaction — resting-state boundary only, not itself the sole affordance |
| `--color-accent` ("Toss Blue") | `#0064FF` | on `--color-bg` | **4.92:1** | Clears the AA floor with real but reduced headroom vs. the prior `#1A56B0` (7.45:1) — the direct cost of Toss's canonical hex; see `docs/decisions/0008` |
| `--color-accent-foreground` | `#FFFFFF` | on `--color-accent` | **4.92:1** | Text/icons on accent-filled surfaces (same pair, ratio is symmetric) |
| `--color-accent-tint` | `#E8F3FF` fill / `#0050D9` text | on `--color-bg` | ≈5.7–6.7:1 | Toss's "two-step blue" secondary — the tinted wash used for `button-secondary` |
| `--color-success` | `#00A85A` | on `--color-bg` | **3.11:1** | **Below the 4.5:1 floor as direct text** — Toss's own token, calibrated for icon/large-surface use in Toss's product, not small text. Not currently wired as a live text color in this codebase (only used decoratively, e.g. confetti particles, which carry no contrast requirement). If ever used as text, do not use this hex directly — see the Status-Color Exception Rule in `DESIGN.md` |
| `--color-error` / `--color-destructive` | `#B91C1C` | on `--color-bg` | **6.47:1** | **Deliberately not** Toss's literal error-fg (`#FF4040`, 3.47:1 — fails the floor as the small text/badge color this codebase actually uses). Kept at the previously-verified value; see `DESIGN.md`'s Status-Color Exception Rule |
| `--color-error-foreground` | `#FFFFFF` | on `--color-error` | **6.47:1** | |
| `--color-focus-ring` | `#0064FF` (now the accent itself, not the text color) | on `--color-bg` | **4.92:1** for the color pairing; ring width/contrast against adjacent fills is a non-text UI-boundary case (WCAG 1.4.11, 3:1 floor), which this clears comfortably | Matches Toss's `border-focus` convention |

### AAA / high-contrast mode

Toggles immediately when the user enables it (spec rule 1). Uses pure contrast `#000000` text and borders on `#FFFFFF` background for maximum 21:1 separation. Re-anchored to the new blue ramp but otherwise unchanged in intent.

| Token | Hex | Paired against | Ratio | Notes |
|---|---|---|---|---|
| `--color-bg` (AAA) | `#FFFFFF` | — | — | |
| `--color-text-primary` (AAA) | `#000000` | on AAA bg | **21.00:1** | |
| `--color-surface` (AAA) | `#F2F4F6` | on AAA bg | — | More surface definition than default (border-only white-on-white), not less — deliberate asymmetry, not an oversight |
| `--color-accent` (AAA) | `#003EA8` (Toss primary-700) | on AAA bg | **9.30:1** | Deeper than the default-mode accent, specifically for stronger contrast in HC mode |

Correction to a prior inaccuracy in this document: accent/primary **is** redefined for AAA mode (both before and after this realignment) — the code (`.high-contrast` block in `app/globals.css`) has always done this; the old prose here claiming otherwise was stale. Success and error tokens are still not redefined for AAA mode — their default-theme values already clear 6:1+, and AAA mode's job is maximizing body-text legibility specifically, not re-deriving every semantic color.

## Typography

Base 18px / 1.125rem, line-height 1.5 — this is the default for everyone, not an enlarged/special-mode size. Font stack: Pretendard → Noto Sans KR → system fallback (see `docs/tech-stack.md`). Letter-spacing is now role-specific and negative (Toss's literal scale), not a uniform +0.02em — see `DESIGN.md`'s Typography frontmatter for the exact per-role value. Weight floor raised to **500** everywhere, including body copy (was 400) — a Toss anti-pattern this product now also enforces; Pretendard renders 500 cleanly at every size below.

| Role | Size | Weight | Line-height | Notes |
|---|---|---|---|---|
| Body / base | 18px / 1.125rem | 500 | 1.5 | Default everywhere — size unchanged by the Toss pass, weight raised 400→500 |
| Small / meta (Label) | 16px / 1rem | 500 | 1.5 | Floor — never go smaller anywhere in this product, including where Toss's own scale would go smaller (its Caption/Body-Small roles run 11–13px and are not used here) |
| Title | 20px / 1.25rem | 700 | 1.3 | Section headers, CTA labels inside 52–64px buttons — weight raised 500→700 |
| Headline | 24px / 1.5rem | 700 | 1.25 | Crosses the actual WCAG large-text threshold (≥24px) |

**Precision note worth keeping in mind during implementation**: 18px equals 13.5pt, which is *below* WCAG's "large text" threshold (18pt/24px). So body text at the 18px base still requires the stricter 4.5:1 ratio, not the relaxed 3:1 — the default-theme text pairing (16.56:1) clears either threshold with room to spare, but this distinction matters if a smaller or lighter-weight combination is ever considered later. The one token in this system that does sit close to (not "well past") its floor is the accent blue itself, not any text color — see Colors § "Floor vs. actual" above.

**Dyslexia-friendly spacing** (opt-in via settings, not default): letter-spacing 0.1em, line-height 1.6, word-spacing 0.14em — kept from legacy's values, available as a settings override rather than the base default (which stays at spec rule 6's 0.02em).

## Spacing & touch targets

| Token | Value | Tailwind utility | Notes |
|---|---|---|---|
| Touch target minimum | 44×44px | `size-11` | Every interactive element, no exceptions |
| Primary CTA (standard) | 56px | `h-14` | 담기 / 다음 |
| Primary CTA (max emphasis) | 64px | `h-16` | Reserved for the single most-critical action per screen — 결제하기 |
| Gap between adjacent buttons | 12px default | `gap-3` | |
| Gap, tight secondary clusters only | 8px | `gap-2` | Never between primary actions — only for e.g. icon clusters in settings |

Tailwind's default numeric spacing scale already lands exactly on these values (`size-11`, `h-14`, `h-16`, `gap-2`, `gap-3`) — no arbitrary values needed for the core numbers this spec requires.

## Focus ring

- Minimum 2px width
- Color: `--color-focus-ring` — now `#0064FF` (Toss Blue itself, not the text color as before) at 4.92:1 in default mode, `#000000` at 21:1 in AAA mode. As a non-text UI-boundary indicator this is judged against WCAG 1.4.11's 3:1 floor, which it clears comfortably in both modes
- 2px `outline-offset`, so the ring doesn't collide with rounded button corners
- Applied via `:focus-visible`, not plain `:focus` — shows for keyboard/switch-control/assistive-tech users without an unwanted ring on every pointer tap. This is the modern, correct interpretation of "a visible focus ring for every focusable element."

## Motion rules

- Every animation (Motion or Lenis — see `docs/tech-stack.md`; GSAP was removed, `docs/decisions/0009-motion-only-animation.md`) collapses to instant/off when the user's `reduceMotion` setting is true. Mechanism differs per library; the outcome must not.
- **No countdown timers or time-pressure UI anywhere, without exception.** If idle/session handling is ever needed later for a real backend/security reason, it must be silent — no visible ticking countdown — and must never auto-clear a user's cart from inactivity in this prototype, since there's no real session-security justification for that yet.
- Any celebratory animation (e.g., an order-success confetti effect) needs a non-animated equivalent state when `reduceMotion` is true — never skip the moment entirely, just skip the motion.
- Keep transitions short and predictable: 150–300ms as a working range. This product's audience benefits from directness over decorative flourish, though small, skippable polish (button press scale, success confetti) is fine.

## Elevation

Elevation communicates layering (what's a sheet, what's a card, what's above what) without relying on color alone — important given rule 4-style "never convey by color alone" thinking extends naturally to state.

| Token | Value | Used for |
|---|---|---|
| `--elevation-0` | none (flat, sits on `--color-bg`) | Page background, inline content |
| `--elevation-1` | `0 2px 8px rgba(25,31,40,0.04), 0 1px 2px rgba(25,31,40,0.02)` | Product cards, resting surfaces |
| `--elevation-2` | `0 8px 20px rgba(25,31,40,0.08), 0 2px 6px rgba(25,31,40,0.04)` | Bottom sheets, popovers, the settings panel |
| `--elevation-3` | `0 16px 36px rgba(25,31,40,0.14), 0 4px 10px rgba(25,31,40,0.06)` | Toasts, anything floating above a sheet |

(This table has drifted from what `app/globals.css` actually shipped twice now — first reading `rgba(33,30,26,…)`, corrected once to `rgba(25,31,40,0.06/0.04-family)` values, and now corrected again to the softer, more-spread values a later redesign pass shipped. Re-verified directly against the live CSS both times rather than assumed still correct — see `docs/decisions/0011-graduated-radius-scale.md` for the reconciliation this correction is part of.)

Shadows use the near-ink foreground token (`rgb(25,31,40)`, from `#191F28`) at low opacity rather than pure black — keeps elevation feeling native to the palette instead of generic. `--color-surface` is now `#FFFFFF` (no longer a distinct color from `--color-bg`), so card boundaries read via `--elevation-1`'s shadow **and** a 1px `--color-border-subtle` border together (**Border-and-Shadow Rule**) — never combine flat `--color-bg`-on-`--color-bg` with no shadow *and* no border and expect a boundary to read.

A small set of CTA-adjacent surfaces (primary button shadow, cart summary pill, QR scanner guide frame) use a blue-tinted glow instead — `rgba(0,100,255,…)` at each call site's own magnitude — matching Toss's own `--shadow-xl` (`reference/TDS_Toss_Merged_Design_System.md` §6). This is inline at each component rather than a fourth shared `--elevation-*` token, since the three call sites want three different magnitudes.

The three `--elevation-*` values above are registered as Tailwind v4 theme keys in `app/globals.css` (`--shadow-resting`, `--shadow-layered`, `--shadow-floating`), which auto-generates matching `shadow-resting`/`shadow-layered`/`shadow-floating` utility classes — components use those directly rather than Tailwind's generic `shadow-xs`/`shadow-md`/etc, so the elevation scale documented here and the elevation actually shipped can't drift apart the way `--color-surface` did before this was wired up.

## Corner radius

**Superseded**: an earlier pass of the Toss realignment (`docs/decisions/0008`) flattened every button to a single 12px radius, following Toss's own literal anti-pattern ("don't scale radius with button height"). A later, more comprehensive redesign pass replaced this with a deliberate **graduated scale** — larger/higher-emphasis surfaces get proportionally larger radii — applied consistently across buttons, cards, icon tiles, and sheets. This is the scale actually shipped today; `docs/decisions/0011-graduated-radius-scale.md` records why the later pass's approach was kept over the earlier ADR's literal-Toss flattening.

| Token | Value | Used for |
|---|---|---|
| `--radius-xs` | 6px | Smallest inline elements |
| `--radius-sm` | 10px | Badges, tags, chips, `xs`/`icon-xs` buttons |
| `--radius-md` | 14px | Default-size buttons/inputs/segmented controls, icon chips |
| `--radius-lg` | 20px | Cards, list items (anchor value — many cards hand-tune to a nearby literal like 22–24px) |
| `--radius-xl` | 26px | Drawers, hero stages, large cards |
| `--radius-2xl` | 32px | Outer containers, feature sections |
| `--radius-full` | 9999px | Pills, circles, steppers, cart-status pill |

Buttons graduate per size rather than mapping to one token: `xs` 10px, `sm` 12px, default 14px, `lg` 16px, `cta` 18px. One radius *family* used consistently — every component picks from this scale (or a literal a few px off an anchor, per the radius-authoring convention in `docs/component-standards.md` §6) rather than inventing an arbitrary value.

## Button hierarchy

Every screen should have exactly one `primary` button at a time (the CTA that advances the flow — 담기/다음/결제하기). Everything else is visually subordinate, on purpose:

| Variant | Look | Used for |
|---|---|---|
| `primary` | Filled `--color-accent` (Toss Blue), `--color-accent-foreground` text, blue-tinted glow shadow, graduated radius by size (10–18px) | The single advancing action per screen |
| `secondary` | Toss's tinted-blue wash fill (`--color-accent-tint`, `#E8F3FF`), `#0050D9` text — the "two-step blue" hierarchy (was: neutral `--color-surface` fill + outline) | Non-destructive alternatives (e.g. "다시 담기" after undo) |
| `ghost` | No fill, no border, `--color-text-primary` text, background tint only on press/focus | Low-emphasis actions (back, cancel inside a sheet) |
| `destructive` | `--color-error` (`#B91C1C`, not Toss's literal coral — see Colors) text or outline, no heavy fill unless it's a confirming step | Remove item, clear cart |

Maps directly onto shadcn's `Button` variant prop (`default`/`secondary`/`ghost`/`destructive`) — this table is what those variants mean *in Jumun*, not a new component to build. Every variant now shares the same `--radius-md` regardless of height — see Corner radius above.

## Imagery

Per `docs/decisions/0013-menu-photography.md`, menu/product imagery uses **real food/beverage photography** (`next/image` + `public/images/menu/*.jpg`), while empty and celebratory states remain **flat vector illustration** (`components/ui/TossIllustrations.tsx`).

### 1. Product Photography (Menu Cards, Featured Carousel, Detail Hero)
- **Full-bleed photography**: The product photo fills the entire card container with `object-cover`.
- **Liquid-glass info overlay**: Rather than a flat, solid info block, the name and price sit in an absolutely-positioned bottom overlay with a subtle theme-matched tint (`themeBg` hex with ~30% alpha), `backdrop-blur-sm`, and a progressive fade-out mask (`mask-image: linear-gradient(to top, black 30%, transparent 100%)`).
- **Fluid vertical title expansion**: Product cards expand vertically when product titles wrap across multiple lines, preserving legibility without text clamping.
- **Desaturated sold-out treatment**: Unavailable items apply `grayscale opacity-60` with a prominent "품절" badge.

### 2. Flat Vector Illustration (Empty & Celebratory States)
- **Empty cart & Staff call**: Rendered with hand-crafted SVG illustrations (`TossIllustrations.tsx`) matching Toss's clean, geometric icon language.
- **Celebration check**: Rendered with fluid spring animation (`successPop`) in `ConfirmationStep.tsx` and the staff-call success drawer.
- Every image and illustration carries descriptive `alt` text or accessible `aria-label`s — visual assets serve as aids, not the sole carriers of information.

## Loading states

Skeleton screens, not spinners, for anything with a predictable shape (menu grid, cart list, order summary) — skeletons preserve layout stability (no content jump when data resolves) and read as considered rather than generic. Reserve a spinner for genuinely unpredictable-duration actions with no shape to preview (the mocked checkout "processing" moment in `docs/features.md`). Skeleton blocks use `--color-border-subtle` as a base with a subtle shimmer sweep — gated behind `reduceMotion` like every other animation; the static (non-shimmering) skeleton shape alone is enough signal when motion is off.

## Empty states

Every list that can legitimately be empty (cart, a filtered menu category) gets a real empty state: a short, specific sentence (not "No results"), one small illustration in the same style as product imagery, and — where there's an obvious next action — a single `secondary`-variant button back to where the user came from. Never a blank area with no explanation; blank-by-omission is exactly the kind of gap that separates a finished product from a scaffold.

## Screen-reader content authoring

Every interactive component carries a deliberately authored, descriptive label — not just its visible text repeated as `aria-label`. This is a first-class design requirement (see `PRODUCT.md`'s Accessibility & Inclusion), not a markup afterthought layered on at the end. Concretely:

- **Product cards**: the accessible name is the full sentence a sighted user gets from glancing at the card, not just the item name — e.g. `아메리카노, 4,500원, 뜨거운 아메리카노` rather than just `아메리카노`. Options/customization state gets summarized the same way once selected.
- **Cart mutations**: every add/remove/quantity change announces via an `aria-live="polite"` region with a complete sentence ("아메리카노 1잔이 장바구니에 담겼습니다"), matching the toast the sighted UI already shows — one authored message, two channels, never a visual-only toast with no live-region equivalent.
- **Icon-only controls** (quantity stepper +/-, remove, back): always a real `aria-label` describing the action and, where ambiguous, its target — "아메리카노 수량 늘리기," not "increase," and never an icon shipped with no label at all.
- **Buttons whose visible label is short**: get an `aria-describedby` pointing at additional context when the button's consequence isn't obvious from its label alone (e.g. 결제하기 on the final screen can reference the order total).

Writing this content is part of building each component, at the same time as its visual design — not a separate accessibility pass done afterward.

## Safe-area-inset handling

The fixed bottom action bar (`docs/decisions/0003-navigation-paradigm.md`) sits directly above the home indicator on notched iPhones and gesture-nav Android devices. Its bottom padding must account for `env(safe-area-inset-bottom)` (via Tailwind's `pb-[env(safe-area-inset-bottom)]` or a token wrapping the same value), on top of — not instead of — the 12px baseline gap, or the CTA reads as uncomfortably close to the system gesture area on real devices. The root `<html>`/`<body>` needs `viewport-fit=cover` in the viewport meta for `env()` values to resolve at all; without it every safe-area token silently computes to zero and this becomes invisible in a desktop-browser device-toolbar preview while still being wrong on a real phone.
