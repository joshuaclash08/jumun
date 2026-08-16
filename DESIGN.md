---
name: Jumun
description: Barrier-free self-order platform — accessible by default, not as a special mode
colors:
  bg: "#FFFFFF"
  surface: "#EFECE4"
  text-primary: "#111827"
  text-secondary: "#4B5563"
  border-subtle: "#E5E7EB"
  border-strong: "#4B5563"
  accent: "#1A56B0"
  accent-foreground: "#FFFFFF"
  success: "#15803D"
  success-foreground: "#FFFFFF"
  error: "#B91C1C"
  error-foreground: "#FFFFFF"
  focus-ring: "#111827"
  bg-aaa: "#FFFFFF"
  text-primary-aaa: "#000000"
typography:
  headline:
    fontFamily: "Pretendard, 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.02em"
  title:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  body:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
  label:
    fontFamily: "Pretendard, 'Noto Sans KR', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
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
    rounded: "{rounded.lg}"
    height: "{spacing.cta-standard}"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    height: "{spacing.cta-standard}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    height: "{spacing.target-min}"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.error}"
    rounded: "{rounded.lg}"
    height: "{spacing.cta-standard}"
---

# Design System: Jumun

## Overview

**Creative North Star: "The Well-Lit Counter"**

Jumun should feel like ordering at a counter where someone deliberately turned the lights up just enough — crisp, clean, nothing glares, nothing hides in shadow, every label sits exactly where a hand expects it. This is an Operate-mode surface: a visitor here is completing a task (ordering food), not being persuaded or entertained, so expression never outranks scanability, and brand lives in precise, correct small details rather than loud gestures. The measure of success isn't "distinctive," it's "a person who has never used a kiosk, and a person who cannot see one, both order lunch without friction."

**Key Characteristics:**
- Crisp, bright white production neutral ground carrying the surface; one accent hue spent only on action and selection, never a wash
- A single workhorse type family across every role, no display face, no serif accent, no mono labels
- Flat by default with restrained, subtle elevation reserved for things that actually float above the page (sheets, toasts)
- Illustration, not photography, for menu imagery — no menu photos exist yet, and a fabricated photorealistic food photo would be a worse failure than a confident flat illustration
- Every visual state (unavailable, error, success, focus) is legible without color, on principle, not as a fallback

## Colors

Crisp production bright white neutral carries the surface; one restrained blue is spent only where a visitor needs to act. Every contrast pair clears WCAG 2.2 AA (4.5:1) and AAA (7:1) with wide margin.

### Primary
- **Jumun Blue** (`#1A56B0`): The only saturated color in the system. Fills the single primary button per screen, marks the selected state (a chosen size, a chosen tab), and colors links. Reads at 7.45:1 on Bright White.

### Neutral
- **Bright White** (`#FFFFFF`): The default page background. Crisp, clean production standard.
- **Card Surface** (`#EFECE4`): A warm oatmeal off-white for cards and other elevated content — deliberately a *visible* step down from Bright White, not a near-imperceptible one, so a screen of cards reads as distinct objects at a glance rather than an undifferentiated white field. Elevation is signaled by this color shift *and* a shadow together, never a shadow alone (see the Never-Alone Rule below). Text on it still clears 15:1+ (default) / 16:1+ (AAA) — darkening the surface only improves text contrast, never risks it.
- **Deep Charcoal** (`#111827`): Primary text and the focus ring, on Bright White. Reads at 16.9:1 — well past the 4.5:1 and 7:1 floors.
- **Muted Slate** (`#4B5563`): Secondary/meta text, and the stroke color for interactive boundaries. Reads at 7.6:1 — clearing both AA and AAA floors.
- **Subtle Divider** (`#E5E7EB`): Decorative dividers and borders.
- **Pure Contrast Black** (`#000000`): Primary text and borders in AAA/high-contrast mode on `#FFFFFF`, yielding 21:1 pure contrast.

### Semantic
- **Confirmed Green** (`#15803D` / `#146C3B`): Success states — order placed, item added. Reads at 7.0+:1 on Bright White.
- **Brick Red** (`#B91C1C` / `#A32118`): Errors and destructive actions. Reads at 7.1+:1 on Bright White.

### Named Rules
**The One Accent Rule.** Jumun Blue appears on exactly one element class per screen — the primary action or the currently-selected option. It never fills a whole region, a whole card, or a whole background. Its rarity is what makes it legible as "the thing to press."

## Typography

**Body Font:** Pretendard, with Noto Sans KR as a CJK-coverage fallback and system UI fonts (`-apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo"`) as the final safety net.

### Hierarchy
- **Headline** (700, 24px, 1.3 line-height): Screen-level headings.
- **Title** (500, 20px, 1.4 line-height): Section headers, emphasized inline content, CTA labels inside 52–64px buttons.
- **Body** (400, 18px, 1.5 line-height): The default everywhere — product names, descriptions, settings labels.
- **Label** (400, 16px, 1.5 line-height): Meta text, timestamps, helper copy.

## Layout

Mobile-first, constrained to Galaxy Z Fold 5 / standard phone viewport width (`max-w-[430px]`) centered on desktop screens with a neutral outer background.

Screens are single-column and single-focus: one task, one or two primary actions, per screen. Secondary content (cart, product detail, settings) layers in as a bottom sheet over the current screen rather than a route change. A fixed bottom action bar (52–64px tall, 12px internal gaps) carries the screen's primary action(s) and always accounts for `env(safe-area-inset-bottom)`.

Screens are single-column and single-focus: one task, one or two primary actions, per screen — never a dashboard-style multi-panel layout. Secondary content (cart, product detail, settings) layers in as a bottom sheet over the current screen rather than a route change, so the visitor's place in the flow never feels lost. A fixed bottom action bar (52–64px tall, 12px internal gaps) carries the screen's primary action(s) and always accounts for `env(safe-area-inset-bottom)` on top of its baseline padding — on notched or gesture-nav phones, the bar's real edge is the safe-area inset, not the button's own padding.

## Elevation & Depth

Flat by default; shallow, charcoal-tinted shadows appear only on things that are genuinely layered above the page — cards resting on the page get the lightest lift, sheets and popovers sit above that, and toasts float above everything. Shadows use the Deep Charcoal token at low opacity rather than pure black, so elevation reads as native to the warm palette instead of a generic drop-shadow bolted on.

### Shadow Vocabulary
Shipped as Tailwind v4 theme tokens in `app/globals.css` (`--shadow-resting/layered/floating`), which auto-generate `shadow-resting`/`shadow-layered`/`shadow-floating` utility classes — components use those directly, not Tailwind's generic `shadow-xs`/`shadow-md`.
- **Resting** (`box-shadow: 0 1px 2px rgba(17,24,39,0.06), 0 1px 1px rgba(17,24,39,0.04)`): Product cards and other content sitting directly on the page.
- **Layered** (`box-shadow: 0 4px 12px rgba(17,24,39,0.10), 0 2px 4px rgba(17,24,39,0.06)`): Bottom sheets and popovers.
- **Floating** (`box-shadow: 0 12px 32px rgba(17,24,39,0.18), 0 4px 8px rgba(17,24,39,0.10)`): Toasts and anything that appears above an already-open sheet.

### Named Rules
**The Never-Alone Rule.** `Card Surface` on `Bright White` is a nearly-imperceptible color shift by itself — every elevated surface pairs its shadow with either that color shift or a `Subtle Divider` border, never relies on one alone to signal a boundary.

## Shapes

One radius family, used consistently rather than invented per component: 8px for small controls and chips, 12px for cards and inputs, 20px for anything at CTA height (56–64px buttons, a bottom sheet's top corners), and a full pill radius for the cart-status pill and any avatar-style icon. A single considered radius scale is part of what separates this from a generated-looking scaffold — no component gets to pick its own value outside this set.

## Components

### Buttons
- **Shape:** 20px radius at CTA height; buttons below CTA height (ghost/icon buttons) use the 12px card radius instead.
- **Primary:** Jumun Blue fill, white text, Resting shadow. Exactly one per screen — the action that advances the flow (담기 / 다음 / 결제하기). Height scales with emphasis: 56px standard, 64px reserved for the single highest-stakes action in the whole flow (결제하기).
- **Secondary:** `Card Surface` fill with a `Muted Slate` outline, `Deep Charcoal` text — for a non-destructive alternative sitting beside a primary action (e.g. "다시 담기" after an undo).
- **Ghost:** No fill, no border, `Deep Charcoal` text, a background tint appears only on press or focus — for low-emphasis actions like back or cancel-inside-a-sheet.
- **Destructive:** `Brick Red` text or outline, no heavy fill unless the tap is itself a confirming step (remove item, clear cart).
- **Focus / Active:** every button shows a 2px `Deep Charcoal` outline (2px offset) on `:focus-visible`, never on a plain pointer tap; a subtle press-scale (~0.98) confirms a tap without needing a color change.

### Cards
- **Corner:** 12px.
- **Background:** `Card Surface` on `Bright White`.
- **Shadow:** Resting.
- **Border:** none by default — the shadow plus the subtle color lift is the boundary; add a `Subtle Divider` border only where a card sits directly adjacent to another card with no gap between them.

### Bottom Sheets (signature component)
The way flow-scoped secondary content (product detail, cart, checkout) appears — never a full route change. Enters from the bottom with a spring motion, Layered shadow, 20px top-corner radius, `Card Surface` background. One consistent motion signature is used for every sheet in the product, not a bespoke animation per sheet, so the interaction itself becomes a recognizable, learnable pattern rather than novelty per screen. Settings is the one deliberate exception — it's not flow-scoped, so it's a dedicated route instead (`docs/decisions/0007-settings-as-dedicated-route.md`).

### Inputs
- **Style:** `Card Surface` fill, `Muted Slate` 1px stroke, 12px radius. Used sparingly — Phase 1 has only a manual table-number field and an optional order note.
- **Focus:** the same 2px `Deep Charcoal` focus ring as every other interactive element — inputs don't get a special focus treatment distinct from buttons.

### Navigation
There is no persistent navigation chrome — no tab bar, no top nav, no breadcrumb trail. A small settings icon (44px+ target, top corner, linking to the dedicated `/settings` route), a staff-call icon beside it, and, during browsing, a small cart-status pill are the only persistent affordances; everything else is one focused screen at a time with a back control once the visitor is past the first screen. This is a deliberate departure from a typical multi-tab app shell, not an oversight — see `docs/decisions/0003-navigation-paradigm.md`.

## Do's and Don'ts

### Do:
- **Do** keep Jumun Blue to one element class per screen — the primary action or the current selection (**The One Accent Rule**).
- **Do** pair every elevated surface with a shadow or a `Subtle Divider` border — never flat-on-flat with no boundary cue (**The Never-Alone Rule**).
- **Do** hold body text to 18px/1.5/0.02em and never render any text smaller than 16px, anywhere.
- **Do** show unavailable/error/success state through color *and* text *and* icon together — never color alone.
- **Do** collapse every animation (Motion, GSAP, or Lenis) to instant when the visitor's reduced-motion setting is on, no exceptions.
- **Do** give every focusable element the same 2px `Deep Charcoal` focus ring on `:focus-visible` — buttons, inputs, links, all identical.

### Don't:
- **Don't** use pure `#FFFFFF` or pure `#000000` anywhere, in any mode, including AAA/high-contrast (**The No Pure Rule**).
- **Don't** add a second type face, a display serif, or a monospace label anywhere (**The One Face Rule**).
- **Don't** add persistent tab-bar or breadcrumb navigation — the product is a single-focus wizard by design, not a multi-section app shell.
- **Don't** add a countdown timer, a session-expiry warning, or any visible time-pressure element anywhere in the product.
- **Don't** use real food photography or attempt photorealistic generated food images — no real menu photography exists yet; use the flat illustration treatment instead, and label any placeholder imagery as synthetic.
