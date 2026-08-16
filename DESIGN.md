---
name: Jumun
description: Barrier-free self-order platform — accessible by default, not as a special mode
colors:
  bg: "#FFFFFF"
  surface: "#FFFFFF"
  text-primary: "#191F28"
  text-secondary: "#4E5968"
  border-subtle: "#E5E8EB"
  border-strong: "#D1D6DB"
  accent: "#0064FF"
  accent-foreground: "#FFFFFF"
  accent-tint: "#E8F3FF"
  accent-tint-foreground: "#0050D9"
  success: "#00A85A"
  success-foreground: "#FFFFFF"
  error: "#B91C1C"
  error-foreground: "#FFFFFF"
  focus-ring: "#0064FF"
  bg-aaa: "#FFFFFF"
  text-primary-aaa: "#000000"
typography:
  headline:
    fontFamily: "Pretendard, 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.005em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "20px"
  xl: "26px"
  2xl: "32px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  target-min: "44px"
  cta-standard: "56px"
  cta-max: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.md}"
    height: "{spacing.cta-standard}"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-tint-foreground}"
    rounded: "{rounded.md}"
    height: "{spacing.cta-standard}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "{spacing.target-min}"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    height: "{spacing.cta-standard}"
---

# Design System: Jumun

## Overview

**Creative North Star: "The Well-Lit Counter, in Toss's voice"**

Jumun is realigned onto the Toss Design System's playful-fintech visual language (`.claude/skills/toss-design` — the merged reference built from Toss's own Mobile TDS Figma file plus its written brand guide, see `docs/decisions/0008-toss-visual-realignment.md`) while keeping the counter metaphor as the *behavioral* north star: someone deliberately turned the lights up just enough, nothing glares, nothing hides in shadow, every label sits exactly where a hand expects it. This is still an Operate-mode surface — a visitor here is completing a task, not being persuaded or entertained — so Toss's own restraint principle (bright white ground, a single confident blue, exactly one emphasized action per screen) turns out to point the same direction Jumun already needed. The measure of success is unchanged: a person who has never used a kiosk, and a person who cannot see one, both order lunch without friction.

**What changed vs. what's kept, stated plainly:**
- **Changed** — the accent hue (Toss Blue `#0064FF`, not `#1A56B0`), the card treatment (white + 1px border + shadow, not a warm oatmeal color-shift), the corner-radius family (now a 7-step *graduated* "squircle" scale, 6→32px, where larger/higher-emphasis surfaces get proportionally larger radii — a deliberate evolution past the flatter, Toss-literal "every button is 12px" scale an earlier pass of this realignment used; see the Shapes section and `docs/decisions/0011-graduated-radius-scale.md`), the elevation/shadow palette (recolored onto the new near-ink foreground, with softer/more-spread shadow values than the earlier pass), and the page background (pure `#FFFFFF` — Toss doesn't avoid pure white the way the prior system deliberately did).
- **Kept, unconditionally** — every WCAG floor (4.5:1 default / 7:1 AAA contrast, 44px+ touch targets, 2px visible focus rings), the 16px text-size floor (nothing renders smaller, anywhere — this is *tighter* than Toss's own Caption/Body-Small roles, which run 11–13px; those roles are not used here), the single workhorse type family (Pretendard, no display face), flat illustration over photography, no countdown timers, and — explicitly protected for this pass — the NFC/QR hero animation's exact keyframes and the `reduceMotion` gating logic in `components/flow/LandingHeroVisual.tsx` (untouched; it's fully token-driven via `currentColor`/`text-foreground`, so it re-themes automatically without any edit).

**Key Characteristics:**
- Crisp, bright white ground carrying the surface; one accent hue (Toss Blue) spent only on action and selection, never a wash — Toss's One Accent principle and Jumun's prior One Accent Rule turned out to be the same rule already
- A single workhorse type family across every role, no display face, no serif accent, no mono labels — weight floor raised to 500 (Toss's own anti-pattern: body text below weight 500 is banned, and it measurably helps Korean-glyph legibility)
- Flat by default with restrained, subtle elevation reserved for things that actually float above the page (sheets, toasts) — Toss's "그림자 거의 없음" (almost no shadow) mood, which was already Jumun's Never-Alone-adjacent instinct
- Illustration, not photography, for menu imagery — unchanged; no menu photos exist yet, and a fabricated photorealistic food photo would be a worse failure than a confident flat illustration
- Every visual state (unavailable, error, success, focus) is legible without color, on principle, not as a fallback — unchanged, and not something Toss's own spec speaks to either way, so this stays a Jumun-specific floor

## Colors

Crisp bright-white neutral carries the surface; one restrained Toss Blue is spent only where a visitor needs to act. Every contrast pair below is the *actual* computed WCAG ratio, not an estimate — where Toss's literal token would have dropped below this product's 4.5:1 default-mode floor, the token was kept at its previously-verified value instead of adopted literally (see the Named Rules at the end of this section).

**Reference:** `.claude/skills/toss-design/reference/TDS_Toss_Merged_Design_System.md` §0 (the primary-blue conflict resolution) and §2 (the full color ramp) are the source for every hex below. The Figma file's Color System page is the origin of the primary/neutral ramps specifically.

### Primary
- **Toss Blue** (`#0064FF`): The only saturated color in the system. Fills the single primary button per screen, marks the selected state (a chosen size, a chosen tab), and colors links and the focus ring. Reads at **4.92:1** on Bright White — clears the enforced 4.5:1 default-mode floor, but with meaningfully less headroom than the prior `#1A56B0` (7.45:1). This is the direct cost of adopting Toss's canonical anchor hex exactly rather than a darkened variant; accepted deliberately, see `docs/decisions/0008-toss-visual-realignment.md`.
- **Toss Blue Tint** (`#E8F3FF` fill / `#0050D9` text): The tinted-blue "two-step" secondary — Toss's signature move for keeping a second visual weight without a second brand hue. Used for `button-secondary` and hover/selected backgrounds.

### Neutral
- **Bright White** (`#FFFFFF`): The default page background *and* the default card background. Toss doesn't avoid pure white — this is an intentional departure from the prior system's "No Pure Rule" (see Do's and Don'ts).
- **Deep Ink** (`#191F28`): Primary text, on Bright White. Reads at **16.56:1** — well past both the 4.5:1 and 7:1 floors.
- **Muted Slate** (`#4E5968`): Secondary/meta text. Reads at **7.12:1** — clears AAA even in default mode.
- **Subtle Divider** (`#E5E8EB`): Card borders, decorative dividers.
- **Pure Contrast Black** (`#000000`): Primary text and borders in AAA/high-contrast mode on `#FFFFFF`, yielding 21:1.

### Semantic
- **Confirmed Green** (`#00A85A`): Success — order placed, item added, confetti. Toss's canonical success-fg. Icon/large-surface use only (as text on white it computes to ~3.1:1, below this product's floor — see Named Rules).
- **Brick Red** (`#B91C1C`): Errors and destructive actions. **Deliberately not** Toss's literal error-fg (`#FF4040`, ~3.47:1 on white) — kept at the previously-verified value because this codebase renders it as direct small text/badge color (`button.tsx`/`badge.tsx` "destructive" variants), where Toss's brighter coral fails the 4.5:1 floor. See Named Rules.

### Named Rules
**The One Accent Rule.** Toss Blue appears on exactly one element class per screen — the primary action or the currently-selected option. It never fills a whole region, a whole card, or a whole background. Its rarity is what makes it legible as "the thing to press." (Toss calls this the same thing, independently — the rule survives the re-theme unchanged.)

**The Status-Color Exception Rule.** Toss's own semantic fg tokens (`success-fg #00A85A`, `error-fg #FF4040`) are calibrated for icon-sized or large-surface use in Toss's actual product, not as small standalone text — both compute below this product's enforced 4.5:1 floor when rendered as direct text on white. Status colors are not brand-identity-bearing in Toss's own system (only the blue is), so where a token would fail as text, this product keeps its own previously-verified value instead of the literal Toss hex. Applies today to `--destructive` (kept at `#B91C1C`); would apply the same way if a `success` text color is ever wired up.

## Typography

**Body Font:** Pretendard, with Noto Sans KR as a CJK-coverage fallback and system UI fonts (`-apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo"`) as the final safety net — unchanged. Toss Product Sans itself isn't a licensable/available web font, so Pretendard is used exactly where Toss's own fallback chain would land anyway.

**Reference:** `.claude/skills/toss-design/reference/TDS_Toss_Merged_Design_System.md` §3 for Toss's full mobile-canonical type scale and its 500-weight body floor (an explicit Toss anti-pattern this product now also enforces). The roles below are Toss's scale *adapted* to this product's stricter size floor, not a literal copy — see the note after the table.

### Hierarchy
- **Headline** (700, 24px, 1.25 line-height, −0.015em): Screen-level headings. Maps onto Toss's H2 role directly.
- **Title** (700, 20px, 1.3 line-height, −0.015em): Section headers and CTA labels inside 52–64px buttons. Weight raised from the prior 500 to 700 (Toss's floor, and buttons this tall need a visually substantial label). Kept at 20px rather than shrinking to Toss's Body-Large (17px) — this size was already justified by "buttons this tall need labels that don't get lost."
- **Body** (500, 18px, 1.5 line-height, −0.01em): The default everywhere — product names, descriptions, settings labels. Weight raised from 400 to 500 (Toss's body-weight floor); **size kept at 18px**, not shrunk to Toss's 17px Body-Large — no accessibility reason to shrink it, and this size was independently justified before Toss entered the picture.
- **Label** (500, 16px, 1.5 line-height, −0.005em): Meta text, timestamps, helper copy. Weight raised from 400 to 500. **Size held at the 16px floor** — this is the one place Toss's own scale (Caption 11px / Body-Small 13px) is NOT adopted; going smaller than 16px anywhere is a standing product-level accessibility floor (`docs/design-system.md`) that predates and outranks visual-fidelity-to-Toss.

**Numerals:** tabular figures on every monetary value (Toss convention, already this product's practice for prices/totals).

## Layout

Unchanged. Mobile-first, constrained to Galaxy Z Fold 5 / standard phone viewport width (`max-w-[768px]`) centered on desktop screens with a neutral outer background (now `bg-muted`, `#F2F4F6`, rather than the prior hardcoded `#EEECEA`).

Screens are single-column and single-focus: one task, one or two primary actions, per screen. Secondary content (cart, product detail, settings) layers in as a bottom sheet over the current screen rather than a route change — Toss's own stated preference ("Ship bottom-sheet modals on mobile, not page-pushed dialogs") matching what this product already does. A fixed bottom action bar (52–64px tall, 12px internal gaps) carries the screen's primary action(s) and always accounts for `env(safe-area-inset-bottom)`.

## Elevation & Depth

Flat by default — Toss's own mood description ("그림자 거의 없음," almost no shadow); shallow shadows appear only on things genuinely layered above the page. Recolored onto the new near-ink foreground (`rgb(25,31,40)`, from `#191F28`) rather than the prior `rgb(17,24,39)`, magnitudes otherwise unchanged.

### Shadow Vocabulary
Shipped as Tailwind v4 theme tokens in `app/globals.css` (`--shadow-resting/layered/floating`), which auto-generate `shadow-resting`/`shadow-layered`/`shadow-floating` utility classes — components use those directly, not Tailwind's generic `shadow-xs`/`shadow-md`. Values below are the current shipped ones — softer and more spread than an earlier pass of this realignment used, still on the same near-ink (`rgb(25,31,40)`) base.
- **Resting** (`0 2px 8px rgba(25,31,40,0.04), 0 1px 2px rgba(25,31,40,0.02)`): Product cards and other content sitting directly on the page.
- **Layered** (`0 8px 20px rgba(25,31,40,0.08), 0 2px 6px rgba(25,31,40,0.04)`): Bottom sheets and popovers.
- **Floating** (`0 16px 36px rgba(25,31,40,0.14), 0 4px 10px rgba(25,31,40,0.06)`): Toasts and anything that appears above an already-open sheet.

A small set of CTA-adjacent surfaces (the primary button's own shadow, the cart summary pill, the QR scanner's guide frame) use a distinct blue-tinted glow — `rgba(0,100,255,…)` — inline at their call sites rather than as a shared token, matching Toss's own `--shadow-xl` (`0 16px 32px rgba(0,100,255,0.20)`, from the merged reference §6). This is the one place elevation carries brand color instead of neutral charcoal, reserved for surfaces that are themselves inviting a tap.

### Named Rules
**The Border-and-Shadow Rule** (supersedes the prior Never-Alone color-shift rule). Toss cards are white-on-white — the boundary reads via a 1px `border-subtle` border *and* a `shadow-resting` together, not a background color-shift. Every elevated surface still pairs two boundary cues, never relies on one alone; the two cues themselves changed from "shadow + color-shift" to "shadow + border," matching Toss's literal card spec (`reference/TDS_Toss_Merged_Design_System.md` §8).

## Shapes

**Superseded note**: an earlier pass of this Toss realignment (`docs/decisions/0008`) adopted Toss's literal anti-pattern — a flat 12px on every button regardless of height, "Toss doesn't scale radius with size." A later, more comprehensive redesign pass replaced that with a deliberate **graduated "squircle" scale**: radius grows with a surface's size/emphasis, not a fixed value everywhere. This is a considered departure from Toss's literal component spec (which the merged skill reference itself only documents for buttons specifically), applied consistently across the whole app — buttons, cards, sheets, icon tiles — and is the scale actually shipped today. `docs/decisions/0011-graduated-radius-scale.md` records the reconciliation between the two ADRs.

| Token | Value | Used for |
|---|---|---|
| `--radius-xs` | 6px | Smallest inline elements |
| `--radius-sm` | 10px | Badges, tags, chips, `xs`/`icon-xs` buttons |
| `--radius-md` | 14px | Default-size buttons/inputs/segmented controls, icon chips |
| `--radius-lg` | 20px | Cards, list items (anchor value — many cards hand-tune to a nearby literal, e.g. 22–24px, for fine visual weight; see Components below) |
| `--radius-xl` | 26px | Drawers, hero stages, large cards |
| `--radius-2xl` | 32px | Outer containers, feature sections |
| `--radius-full` | 9999px | Pills, circles, steppers, cart-status pill |

Buttons specifically graduate per size rather than mapping to one named token: `xs` 10px, `sm` 12px, default 14px, `lg` 16px, `cta` 18px — each chosen to feel proportional to that button's own height, following the same "radius scales with size" principle as the rest of the scale.

## Components

### Buttons
- **Shape:** graduated radius by size — `xs` 10px, `sm` 12px, default 14px, `lg` 16px, `cta` 18px. Larger, higher-stakes buttons read as proportionally rounder, not just taller.
- **Primary:** Toss Blue fill, white text, a blue-tinted glow shadow (`rgba(0,100,255,…)`, scaled by height). Exactly one per screen — the action that advances the flow (담기 / 다음 / 결제하기). Height scales with emphasis: 56px standard, 64px reserved for the single highest-stakes action in the whole flow (결제하기).
- **Secondary:** Toss's tinted-blue wash (`#E8F3FF` fill, `#0050D9` text) — the "two-step blue" hierarchy, replacing the prior neutral-surface-fill secondary. Used for a non-destructive alternative sitting beside a primary action (e.g. "다시 담기" after an undo).
- **Ghost:** No fill, no border, `Deep Ink` text, a background tint appears only on press or focus — unchanged in behavior.
- **Destructive:** `Brick Red` (`#B91C1C`, not Toss's literal coral — see Colors § Named Rules) text or outline, no heavy fill unless the tap is itself a confirming step (remove item, clear cart).
- **Focus / Active:** every button shows a 2px `Toss Blue` outline (2px offset) on `:focus-visible` — changed from the prior charcoal ring to the brand blue itself, matching Toss's `border-focus` convention, never on a plain pointer tap; a firm press-scale (content controls `0.96`, icon controls `0.90` — `docs/decisions/0010-deeper-press-feedback.md`) confirms a tap without needing a color change.
- **Standing rule regardless of exact radius:** never render a button under `--radius-sm` (10px) — Toss's own anti-pattern against sharp/near-square buttons still applies at every step of the graduated scale.

### Cards
- **Corner:** 22px at default size, 16px at the compact (`size="sm"`) variant — both sit between the `--radius-lg` (20px) and `--radius-xl` (26px) anchor tokens, hand-tuned for visual weight per the radius-authoring convention (`docs/component-standards.md` §6).
- **Background:** `Bright White` on `Bright White` — no longer a visible color-shift (was `Card Surface` `#EFECE4`).
- **Border:** 1px `Subtle Divider`, always present now (was: none by default, added only between adjacent flush cards). Together with the shadow below, this is the boundary — see the Border-and-Shadow Rule.
- **Shadow:** Resting.

### Bottom Sheets (signature component)
The way flow-scoped secondary content (product detail, cart, checkout) appears — never a full route change; this is also explicitly Toss's own stated preference. Enters from the bottom with a spring motion, Layered shadow, `Bright White` background. One consistent motion signature is used for every sheet in the product. Settings remains the one deliberate exception — a dedicated route, not a sheet (`docs/decisions/0007-settings-as-dedicated-route.md`).

### Inputs
- **Style:** `#F2F4F6` (Toss `bg-subtle`) fill, `#D1D6DB` 1px stroke, `--radius-md` (14px). Used sparingly — Phase 1 has only a manual table-number field and an optional order note.
- **Focus:** the same 2px `Toss Blue` focus ring as every other interactive element.

### Navigation
Unchanged. No persistent navigation chrome — no tab bar, no top nav, no breadcrumb trail. A small settings icon (44px+ target, top corner), a staff-call icon beside it, and a small cart-status pill during browsing are the only persistent affordances.

## Do's and Don'ts

### Do:
- **Do** keep Toss Blue to one element class per screen — the primary action or the current selection (**The One Accent Rule**).
- **Do** pair every elevated surface with a shadow *and* a border (**The Border-and-Shadow Rule**).
- **Do** hold body text to 18px/1.5/−0.01em minimum weight 500, and never render any text smaller than 16px, anywhere — including where Toss's own scale would go smaller (Caption/Body-Small are not used in this product).
- **Do** show unavailable/error/success state through color *and* text *and* icon together — never color alone.
- **Do** collapse every animation (Motion or Lenis — GSAP was removed, `docs/decisions/0009-motion-only-animation.md`) to instant when the visitor's reduced-motion setting is on, no exceptions — including the NFC/QR hero animation, whose `reduceMotion` gating was verified unchanged by this pass.
- **Do** give every focusable element the same 2px `Toss Blue` focus ring on `:focus-visible` — buttons, inputs, links, all identical.
- **Do** keep button radius on the documented graduated scale (10/12/14/16/18px by size) — don't invent a new radius value per component; pick the nearest step.

### Don't:
- **Don't** use Toss's literal semantic fg colors (`#FF4040` error, `#00A85A` success) as small standalone text — both fail this product's 4.5:1 floor at that use; use them as icon/large-surface accents only, or the paired bg tint (**The Status-Color Exception Rule**).
- **Don't** add a second type face, a display serif, or a monospace label anywhere (**The One Face Rule**) — unchanged.
- **Don't** add persistent tab-bar or breadcrumb navigation — unchanged.
- **Don't** add a countdown timer, a session-expiry warning, or any visible time-pressure element anywhere — unchanged.
- **Don't** use real food photography or attempt photorealistic generated food images — unchanged; flat illustration only.
- **Don't** touch `components/flow/LandingHeroVisual.tsx`'s animation keyframes, timing, or `reduceMotion` gating when making further Toss-alignment passes — it's fully token-driven already and was explicitly protected during this realignment.
