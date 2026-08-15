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

## Color

All contrast ratios are computed via the WCAG relative-luminance formula, not estimated.

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
