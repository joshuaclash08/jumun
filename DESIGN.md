---
name: Jumun
description: Barrier-free self-order platform — accessible by default, not as a special mode
colors:
  bg: "#F7F3EC"
  surface: "#FBF9F5"
  text-primary: "#211E1A"
  text-secondary: "#55504A"
  border-subtle: "#D8D2C4"
  border-strong: "#55504A"
  accent: "#1A56B0"
  accent-foreground: "#FFFFFF"
  success: "#146C3B"
  success-foreground: "#FFFFFF"
  error: "#A32118"
  error-foreground: "#FFFFFF"
  focus-ring: "#211E1A"
  bg-aaa: "#FBF9F5"
  text-primary-aaa: "#17140F"
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

Jumun should feel like ordering at a counter where someone deliberately turned the lights up just enough — nothing glares, nothing hides in shadow, every label sits exactly where a hand expects it. This is an Operate-mode surface: a visitor here is completing a task (ordering food), not being persuaded or entertained, so expression never outranks scanability, and brand lives in precise, correct small details rather than loud gestures. The measure of success isn't "distinctive," it's "a person who has never used a kiosk, and a person who cannot see one, both order lunch without friction."

Two confirmed visual rejections shape everything below. First, decoration-as-craft: this is not a portfolio piece, and any flourish that doesn't serve legibility or hierarchy is scope creep. Second, the recognizable AI-generated-interface looks — warm cream ground with a high-contrast serif display and a terracotta/signal-red accent; near-black with one neon accent and glowing edges; broadsheet-editorial hairlines with an italic serif and tracked mono labels — were checked against deliberately and none of the three fit what's built here. What "not AI slop" means concretely on this project: does every screen look like it belongs to a real, shipped, maintained ordering product a person could download today, with the small correct details — real button hierarchy, real loading states, real empty states, safe-area-aware spacing — that generic scaffolds skip.

**Key Characteristics:**
- Warm, glare-free neutral ground carrying nearly the whole surface; one accent hue spent only on action and selection, never a wash
- A single workhorse type family across every role, no display face, no serif accent, no mono labels
- Flat by default with restrained, charcoal-tinted elevation reserved for things that actually float above the page (sheets, toasts)
- Illustration, not photography, for menu imagery — no menu photos exist yet, and a fabricated photorealistic food photo would be a worse failure than a confident flat illustration
- Every visual state (unavailable, error, success, focus) is legible without color, on principle, not as a fallback

## Colors

Warm, paper-toned neutrals carry the surface; one restrained blue is spent only where a visitor needs to act. Nothing here is pure black or pure white — both cause optical glare for the low-vision and elderly users this product is built around, so the whole palette sits inside a softened, high-contrast-but-not-harsh range instead.

### Primary
- **Jumun Blue** (`#1A56B0`): The only saturated color in the system. Fills the single primary button per screen, marks the selected state (a chosen size, a chosen tab), and colors links. Deliberately distinct from Toss's blue (`#3182f6`) and from any fintech-app blue — chosen darker and less saturated so it reads as "confirm" rather than "notification."

### Neutral
- **Warm Linen** (`#F7F3EC`): The default background, every screen, every mode. A glare-reducing off-white, not a pure white — the base the whole system stands on.
- **Lifted Linen** (`#FBF9F5`): Cards, sheets, and anything that sits one layer above the page. Barely lighter than Warm Linen on purpose — the lift is a cue, not a spotlight; pair it with a shadow or `Faint Linen Line` border, never leave it to read as a boundary alone.
- **Deep Charcoal** (`#211E1A`): Primary text and the focus ring, on Warm Linen. Reads at 15.01:1 — well past the 4.5:1 floor, so text feels effortless rather than merely passable.
- **Warm Slate** (`#55504A`): Secondary/meta text, and the stroke color for real interactive boundaries (inputs, buttons that need an outline). Reads at 7.21:1 — still comfortably AA, one step quieter than Deep Charcoal.
- **Faint Linen Line** (`#D8D2C4`): Decorative dividers only. Never the sole signal of an interactive edge — pair with `Warm Slate` or a shadow whenever the boundary actually matters.
- **Deepest Charcoal** (`#17140F`): Primary text in AAA/high-contrast mode, on `Lifted Linen`. Reads at 17.47:1. Stays in the same warm family rather than jumping to literal black — the toggle sharpens, it doesn't change identity.

### Semantic
- **Confirmed Green** (`#146C3B`): Success states — order placed, item added. Reads at 5.86:1 on Warm Linen.
- **Brick Red** (`#A32118`): Errors and destructive actions — a deep, slightly warm red rather than an alarm-red, so it reads as "needs attention" without visually shouting. Reads at 6.81:1 on Warm Linen.

### Named Rules
**The One Accent Rule.** Jumun Blue appears on exactly one element class per screen — the primary action or the currently-selected option. It never fills a whole region, a whole card, or a whole background. Its rarity is what makes it legible as "the thing to press."

**The No Pure Rule.** `#FFFFFF` and `#000000` never appear as a fill anywhere in the system, default or AAA mode alike — every neutral, including the darkest text and the lightest background, stays inside the warm Linen/Charcoal family. This is an accessibility invariant (glare reduction), not a stylistic preference, and it does not relax under high-contrast mode.

## Typography

**Body Font:** Pretendard, with Noto Sans KR as a CJK-coverage fallback and system UI fonts (`-apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo"`) as the final safety net.

**Character:** A single, honest workhorse Gothic face used at every size, from the smallest meta label to the largest heading — a system-style UI face with no point of view, chosen because a reader here needs speed and neutrality, not typographic mood.

### Hierarchy
- **Headline** (700, 24px, 1.3 line-height): Screen-level headings. The one tier that crosses WCAG's actual "large text" threshold (≥24px), though the palette clears AA either way.
- **Title** (500, 20px, 1.4 line-height): Section headers, emphasized inline content, CTA labels inside 52–64px buttons (which need visually substantial labels, not small text lost in a big box).
- **Body** (400, 18px, 1.5 line-height): The default everywhere — product names, descriptions, settings labels. 18px is deliberately above the typical mobile-web default (16px), and below WCAG's "large text" threshold (18pt/24px), so body text is held to the stricter 4.5:1 floor on principle, not the relaxed 3:1 one.
- **Label** (400, 16px, 1.5 line-height): Meta text, timestamps, helper copy — the floor. Nothing in the product ever renders smaller than this, even where a generic app would drop to 12–14px.

An optional dyslexia-friendly variant widens spacing (letter-spacing 0.1em, line-height 1.6, word-spacing 0.14em) without changing the face or the size scale — available from settings, never the default.

### Named Rules
**The One Face Rule.** Pretendard carries every role, label through headline. No second display face, no serif accent, no monospace label — a single, honest face keeps a 70-year-old and a 20-year-old reading at the same speed.

## Layout

Mobile-only, fluid within the real phone-width band (roughly 360–430px) — not one fixed pixel size, and zero effort spent scaling up to tablet or desktop breakpoints. No centered desktop letterbox container; the app simply doesn't compose for wider viewports.

Screens are single-column and single-focus: one task, one or two primary actions, per screen — never a dashboard-style multi-panel layout. Secondary content (cart, product detail, settings) layers in as a bottom sheet over the current screen rather than a route change, so the visitor's place in the flow never feels lost. A fixed bottom action bar (52–64px tall, 12px internal gaps) carries the screen's primary action(s) and always accounts for `env(safe-area-inset-bottom)` on top of its baseline padding — on notched or gesture-nav phones, the bar's real edge is the safe-area inset, not the button's own padding.

## Elevation & Depth

Flat by default; shallow, charcoal-tinted shadows appear only on things that are genuinely layered above the page — cards resting on the page get the lightest lift, sheets and popovers sit above that, and toasts float above everything. Shadows use the Deep Charcoal token at low opacity rather than pure black, so elevation reads as native to the warm palette instead of a generic drop-shadow bolted on.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(33,30,26,0.06), 0 1px 1px rgba(33,30,26,0.04)`): Product cards and other content sitting directly on the page.
- **Layered** (`box-shadow: 0 4px 12px rgba(33,30,26,0.10), 0 2px 4px rgba(33,30,26,0.06)`): Bottom sheets, popovers, the settings panel.
- **Floating** (`box-shadow: 0 12px 32px rgba(33,30,26,0.16), 0 4px 8px rgba(33,30,26,0.08)`): Toasts and anything that appears above an already-open sheet.

### Named Rules
**The Never-Alone Rule.** `Lifted Linen` on `Warm Linen` is a nearly-imperceptible color shift by itself — every elevated surface pairs its shadow with either that color shift or a `Faint Linen Line` border, never relies on one alone to signal a boundary.

## Shapes

One radius family, used consistently rather than invented per component: 8px for small controls and chips, 12px for cards and inputs, 20px for anything at CTA height (56–64px buttons, a bottom sheet's top corners), and a full pill radius for the cart-status pill and any avatar-style icon. A single considered radius scale is part of what separates this from a generated-looking scaffold — no component gets to pick its own value outside this set.

## Components

### Buttons
- **Shape:** 20px radius at CTA height; buttons below CTA height (ghost/icon buttons) use the 12px card radius instead.
- **Primary:** Jumun Blue fill, white text, Resting shadow. Exactly one per screen — the action that advances the flow (담기 / 다음 / 결제하기). Height scales with emphasis: 56px standard, 64px reserved for the single highest-stakes action in the whole flow (결제하기).
- **Secondary:** `Lifted Linen` fill with a `Warm Slate` outline, `Deep Charcoal` text — for a non-destructive alternative sitting beside a primary action (e.g. "다시 담기" after an undo).
- **Ghost:** No fill, no border, `Deep Charcoal` text, a background tint appears only on press or focus — for low-emphasis actions like back or cancel-inside-a-sheet.
- **Destructive:** `Brick Red` text or outline, no heavy fill unless the tap is itself a confirming step (remove item, clear cart).
- **Focus / Active:** every button shows a 2px `Deep Charcoal` outline (2px offset) on `:focus-visible`, never on a plain pointer tap; a subtle press-scale (~0.98) confirms a tap without needing a color change.

### Cards
- **Corner:** 12px.
- **Background:** `Lifted Linen` on `Warm Linen`.
- **Shadow:** Resting.
- **Border:** none by default — the shadow plus the subtle color lift is the boundary; add a `Faint Linen Line` border only where a card sits directly adjacent to another card with no gap between them.

### Bottom Sheets (signature component)
The primary way secondary content (product detail, cart, settings) appears — never a full route change. Enters from the bottom with a spring motion, Layered shadow, 20px top-corner radius, `Lifted Linen` background. One consistent motion signature is used for every sheet in the product, not a bespoke animation per sheet, so the interaction itself becomes a recognizable, learnable pattern rather than novelty per screen.

### Inputs
- **Style:** `Lifted Linen` fill, `Warm Slate` 1px stroke, 12px radius. Used sparingly — Phase 1 has only a manual table-number field and an optional order note.
- **Focus:** the same 2px `Deep Charcoal` focus ring as every other interactive element — inputs don't get a special focus treatment distinct from buttons.

### Navigation
There is no persistent navigation chrome — no tab bar, no top nav, no breadcrumb trail. A small settings icon (44px+ target, top corner) and, during browsing, a small cart-status pill are the only persistent affordances; everything else is one focused screen at a time with a back control once the visitor is past the first screen. This is a deliberate departure from a typical multi-tab app shell, not an oversight — see `docs/decisions/0003-navigation-paradigm.md`.

## Do's and Don'ts

### Do:
- **Do** keep Jumun Blue to one element class per screen — the primary action or the current selection (**The One Accent Rule**).
- **Do** pair every elevated surface with a shadow or a `Faint Linen Line` border — never flat-on-flat with no boundary cue (**The Never-Alone Rule**).
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
