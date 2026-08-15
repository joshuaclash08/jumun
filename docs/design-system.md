# Design System

This document turns Jumun's accessibility specification into concrete, implementable design tokens. It is the single source of truth for color, typography, spacing, focus, and motion — every value here is meant to become a literal CSS custom property in `app/globals.css`'s `@theme` block once implementation starts (see `docs/tech-stack.md` on Tailwind v4's theming approach).

These rules apply to **every user, by default** — see `docs/decisions/0001-onboarding-model.md`. There is no separate "accessible mode" to opt into; this is just how Jumun looks and behaves.

## Source specification

The baseline requirements below were specified directly for this project:

1. **Contrast** — minimum 4.5:1 for body text against its background (WCAG 2.2 AA); large text (18pt+/24px+, or 14pt+/bold) may use 3:1. High-contrast mode switches immediately to AAA (7:1).
2. **Touch targets** — minimum 44×44px on every clickable element; primary CTAs recommended at 52–64px. Minimum 8–12px gap between adjacent buttons to prevent mis-taps. Core actions (담기/다음/결제하기) belong in a fixed bottom bar for one-handed, thumb-zone reach.
3. **Focus** — every focusable element gets a minimum 2px, high-contrast visible outline.
4. **No time pressure** — no countdown timers, no "resets in N seconds" banners, anywhere.
5. **Default theme** — a glare-reducing off-white background with deep charcoal text, contrast ratio ≥15:1, explicitly avoiding pure `#FFFFFF`/`#000000` (which causes optical afterimage and glare for low-vision and elderly users).
6. **Typography** — readable Gothic-style fonts (Pretendard, Noto Sans KR); base size ≥18px (1.125rem), line-height ≥1.5, letter-spacing 0.02em by default.

Everything below is these six rules translated into exact values.

## Visual direction

Jumun is an **Operate**-mode surface (a visitor completing a task — ordering — not being persuaded or entertained). In Operate mode, expression never outranks scanability, consistency, and familiar affordances; brand and personality live in precise details, not loud gestures. This shapes every choice below, and is why the direction stays closer to "a very well-made ordering app" than to a portfolio piece.

**Color strategy: Restrained** (neutrals plus one accent) — the default and correct choice for an Operate surface, chosen deliberately rather than by default. `--color-bg`/`--color-text-primary` carry the whole surface; `--color-accent` ("Jumun Blue") is spent only on primary actions, links, and selected state — never a whole-region wash. A Committed or Drenched strategy (color owning 30%+ of the surface) would fight legibility and focus precisely where this product can least afford it.

**Typography: workhorse, not display.** Pretendard and Noto Sans KR are system-style UI faces, not faces with a point of view — correct for Operate, where a reader needs speed and neutrality, not a typographic mood. A display serif or an expressive grotesque would be the wrong tool here even before accessibility is considered.

**Explicitly avoided, on purpose:** AI-generated interfaces cluster around a handful of recognizable looks regardless of subject — warm cream ground + high-contrast serif display + terracotta/signal-red accent; near-black + one neon accent with glowing edges; broadsheet-editorial hairlines + italic serif + small tracked mono labels. Jumun's palette (warm off-white, deep charcoal, a restrained mid-blue accent, no glow, no editorial mono) doesn't land in any of those three — checked deliberately, not by accident. If a future revision of this palette starts resembling one of them, that's a signal to rework it, not a coincidence to ignore.

**What "not AI slop" actually means here**: not decoration — restraint, applied precisely. The bar is: does every screen look like it belongs to a real, shipped, maintained ordering product a person could download today, with the small correct details (real button hierarchy, real loading states, real empty states, safe-area-aware spacing) that generic scaffolds skip. Sections below on elevation, radius, button hierarchy, imagery, and loading/empty states exist specifically to close that gap.

## Color

All contrast ratios are computed via the WCAG relative-luminance formula, not estimated.

**Floor vs. actual, stated explicitly to avoid ambiguity:** 4.5:1 is the enforced *minimum* for default-mode body text — nothing may ever go below it — and 7:1 is the enforced *minimum* once high-contrast mode is on. The values below exceed both floors by design (default ≈15:1, high-contrast ≈17:1): the floor is a compliance guarantee, not a target to land exactly on. A default theme that only just cleared 4.5:1 would still pass an automated check while looking washed-out; landing well past it is what makes text feel effortless rather than merely legible, which matters more here than in a typical product given the audience.

### Default theme

| Token | Hex | Paired against | Ratio | Meets |
|---|---|---|---|---|
| `--color-bg` | `#F7F3EC` (warm off-white) | — | — | Avoids pure `#FFFFFF` per spec rule 5 |
| `--color-surface` (cards/elevated content) | `#FBF9F5` | — | — | Subtly lighter than bg — cheap elevation cue without a shadow-only signal |
| `--color-text-primary` (deep charcoal) | `#211E1A` | on `--color-bg` | **15.01:1** | Clears the ≥15:1 default-theme target (rule 5) |
| `--color-text-secondary` (muted/meta text) | `#55504A` | on `--color-bg` | **7.21:1** | AA (4.5:1) with wide margin |
| `--color-border-subtle` (decorative dividers only) | `#D8D2C4` | on `--color-bg` | 1.36:1 | Decorative only — never the sole indicator of an interactive boundary |
| `--color-border-strong` (input/interactive boundaries) | `#55504A` | on `--color-bg` | **7.21:1** | Clears WCAG 1.4.11 non-text 3:1 requirement comfortably |
| `--color-accent` ("Jumun Blue" — deliberately distinct from legacy's Toss Blue `#3182f6`) | `#1A56B0` | on `--color-bg` | **6.32:1** | Used for primary CTA fills, links, selected-state indicators |
| `--color-accent-foreground` | `#FFFFFF` | on `--color-accent` | **7.00:1** | Text/icons on accent-filled surfaces |
| `--color-success` | `#146C3B` | on `--color-bg` | **5.86:1** | |
| `--color-success-foreground` | `#FFFFFF` | on `--color-success` | **6.49:1** | |
| `--color-error` / `--color-destructive` | `#A32118` | on `--color-bg` | **6.81:1** | |
| `--color-error-foreground` | `#FFFFFF` | on `--color-error` | **7.53:1** | |
| `--color-focus-ring` | reuses `--color-text-primary` (`#211E1A`) | on `--color-bg` | **15.01:1** | See "Focus ring" section — the spec's `#000` example is illustrative syntax, not a literal mandated hex |

### AAA / high-contrast mode

Toggles immediately when the user enables it (spec rule 1). Stays within the same warm-toned family rather than jumping to literal pure black/white — this keeps the toggle from feeling like a jarring hue-shift while still clearing 7:1 by a wide margin. (If real-world testing shows users want a literal pure-black/pure-white option for maximum possible separation, that's a one-token change — flagged as an easy future adjustment, not a structural one.)

| Token | Hex | Paired against | Ratio |
|---|---|---|---|
| `--color-bg` (AAA) | `#FBF9F5` | — | — |
| `--color-text-primary` (AAA) | `#17140F` | on AAA bg | **17.47:1** |

Accent, success, and error tokens are not redefined for AAA mode — their default-theme values already clear 6:1+ against the off-white family, and AAA mode's job is maximizing body-text legibility specifically, not re-deriving every semantic color.

## Typography

Base 18px / 1.125rem, line-height 1.5, letter-spacing 0.02em — this is the default for everyone, not an enlarged/special-mode size. Font stack: Pretendard → Noto Sans KR → system fallback (see `docs/tech-stack.md`).

| Role | Size | Line-height | Notes |
|---|---|---|---|
| Body / base | 18px / 1.125rem | 1.5 | Default everywhere |
| Small / meta | 16px / 1rem | 1.5 | Floor — never go smaller anywhere in this product |
| Large / emphasis | 20px / 1.25rem | 1.4 | |
| Heading | 24px / 1.5rem, weight 700 | 1.3 | Crosses the actual WCAG large-text threshold (≥24px) |
| CTA label (inside 52–64px buttons) | 18–20px, weight 600/700 | — | Buttons this tall need visually substantial labels, not small text lost in a big box |

**Precision note worth keeping in mind during implementation**: 18px equals 13.5pt, which is *below* WCAG's "large text" threshold (18pt/24px). So body text at the 18px base still requires the stricter 4.5:1 ratio, not the relaxed 3:1 — our default-theme pairing (15.01:1) clears either threshold with room to spare, but this distinction matters if a smaller or lighter-weight combination is ever considered later.

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
- Color: `--color-focus-ring` (verified 15.01:1+ contrast in every mode)
- 2px `outline-offset`, so the ring doesn't collide with rounded button corners
- Applied via `:focus-visible`, not plain `:focus` — shows for keyboard/switch-control/assistive-tech users without an unwanted ring on every pointer tap. This is the modern, correct interpretation of "a visible focus ring for every focusable element."

## Motion rules

- Every animation (Framer Motion, GSAP, or Lenis — see `docs/tech-stack.md`) collapses to instant/off when the user's `reduceMotion` setting is true. Mechanism differs per library; the outcome must not.
- **No countdown timers or time-pressure UI anywhere, without exception.** If idle/session handling is ever needed later for a real backend/security reason, it must be silent — no visible ticking countdown — and must never auto-clear a user's cart from inactivity in this prototype, since there's no real session-security justification for that yet.
- Any celebratory animation (e.g., an order-success confetti effect) needs a non-animated equivalent state when `reduceMotion` is true — never skip the moment entirely, just skip the motion.
- Keep transitions short and predictable: 150–300ms as a working range. This product's audience benefits from directness over decorative flourish, though small, skippable polish (button press scale, success confetti) is fine.

## Elevation

Elevation communicates layering (what's a sheet, what's a card, what's above what) without relying on color alone — important given rule 4-style "never convey by color alone" thinking extends naturally to state.

| Token | Value | Used for |
|---|---|---|
| `--elevation-0` | none (flat, sits on `--color-bg`) | Page background, inline content |
| `--elevation-1` | `0 1px 2px rgba(33,30,26,0.06), 0 1px 1px rgba(33,30,26,0.04)` | Product cards, resting surfaces |
| `--elevation-2` | `0 4px 12px rgba(33,30,26,0.10), 0 2px 4px rgba(33,30,26,0.06)` | Bottom sheets, popovers, the settings panel |
| `--elevation-3` | `0 12px 32px rgba(33,30,26,0.16), 0 4px 8px rgba(33,30,26,0.08)` | Toasts, anything floating above a sheet |

Shadows use the charcoal token at low opacity rather than pure black — keeps elevation feeling native to the warm palette instead of generic. `--color-surface` (`#FBF9F5`) plus `--elevation-1` is the default card treatment; never combine flat `--color-bg`-on-`--color-bg` with no shadow and expect a boundary to read — pair every elevated surface with either a shadow or `--color-border-subtle`, not neither.

## Corner radius

| Token | Value | Used for |
|---|---|---|
| `--radius-sm` | 8px | Chips, badges, small controls |
| `--radius-md` | 12px | Cards, inputs |
| `--radius-lg` | 20px | Buttons at CTA height (56–64px), bottom sheets' top corners |
| `--radius-full` | 9999px | Pills (cart status pill), avatar-style icons |

One radius family used consistently is part of what separates a considered system from a generated-looking one — don't let individual components invent their own radius values.

## Button hierarchy

Every screen should have exactly one `primary` button at a time (the CTA that advances the flow — 담기/다음/결제하기). Everything else is visually subordinate, on purpose:

| Variant | Look | Used for |
|---|---|---|
| `primary` | Filled `--color-accent`, `--color-accent-foreground` text, `--elevation-1` | The single advancing action per screen |
| `secondary` | `--color-surface` fill, `--color-border-strong` outline, `--color-text-primary` text | Non-destructive alternatives (e.g. "다시 담기" after undo) |
| `ghost` | No fill, no border, `--color-text-primary` text, background tint only on press/focus | Low-emphasis actions (back, cancel inside a sheet) |
| `destructive` | `--color-error` text or outline, no heavy fill unless it's a confirming step | Remove item, clear cart |

Maps directly onto shadcn's `Button` variant prop (`default`/`secondary`/`ghost`/`destructive`) — this table is what those variants mean *in Jumun*, not a new component to build.

## Imagery

No real menu photography exists yet (see `PRODUCT.md`'s Evidence on Hand), and attempting photorealistic fake food photos for a fictional menu risks landing exactly in "obviously AI-generated stock photo" territory — the opposite of what's being asked for. Instead: **a consistent, flat, geometric icon/illustration treatment per menu item**, not photography. Concretely — a fixed-aspect (1:1) container per product, `--radius-md` corners, a limited 2–3 tone illustration style built from the same palette (charcoal linework, accent-blue or warm neutral fills, no gradients, no drop shadows on the illustration itself), consistent stroke weight across every item. This reads as a deliberate design system decision rather than a placeholder, is achievable without real assets or image generation, and sidesteps the fake-photo problem entirely. Every image still carries real, descriptive alt text (see "Screen-reader content" below) — the illustration is a visual aid, not the source of truth for what the item is.

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
