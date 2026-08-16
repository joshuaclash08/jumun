# Animation & Interaction Standards Guide

This document establishes the official animation, transition, and micro-interaction standards for Jumun.

---

## 1. Library Roles & Division of Responsibility

**As of `docs/decisions/0009-motion-only-animation.md`, GSAP has been removed.** It was used in exactly one place (the confirmation-step reveal), and that call site is now expressed with Motion's own `variants`/`staggerChildren` — see §3D below.

| Library | Role | Usage |
|---|---|---|
| **Motion (`motion/react`)** | All declarative *and* orchestrated Component & UI Interactions | Button/card press physics (`whileTap`), step-to-step wizard transitions (`AnimatePresence`), list layout reflow (`layout` prop), toast enter/exit, bottom sheet content motion, *and* multi-node staggered/celebratory sequences (`variants` + `staggerChildren`/`delayChildren`) — the confirmation-step reveal is the reference example. |
| **Lenis (`lenis`)** | Global Momentum Smooth Scrolling | Natural touch/wheel scroll momentum across the entire menu and pages, gated by `useLenisMotionSync`. |

---

## 2. Standard Motion Parameters

### Spring Physics (Touch & Press Feedback)
- **Stiffness**: `400`
- **Damping**: `25`
- **Mass**: `1`
- **Press Scale — content controls** (buttons, cards, list rows, selection options): **`0.96`** (deepened from the prior `0.97`~`0.98` — a more pronounced, intentionally tactile press, not a barely-perceptible one)
- **Press Scale — icon/chip controls** (icon-only buttons, nav chips, category tabs): **`0.90`** (deepened from the prior `0.94`~`0.96` range) — small controls can afford a bigger *relative* scale change before it reads as excessive deformation, and the extra intensity helps compensate for their smaller visual footprint making subtle presses easy to miss

```tsx
// Content control (button, card, selection row)
<motion.button
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  ...
</motion.button>

// Icon/chip control
<motion.div
  whileTap={{ scale: 0.90 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  ...
</motion.div>
```

`components/ui/button.tsx`'s own CSS-only `:active` fallback (`active:scale-[0.98]`, used when a `Button` isn't wrapped in a `motion.div`) is deepened to `active:scale-[0.96]` to match the content-control standard above — see `docs/decisions/0010-deeper-press-feedback.md`.

### Celebratory / Content-Emphasis Motion
Not every entrance should use the same recipe — a state that's meant to feel like a small win (order confirmed, an item successfully added) earns a distinct, bouncier treatment instead of the standard fade+rise, so the motion itself carries some of the meaning:
- **Spring**: `stiffness: 300, damping: 15` (looser/bouncier than the standard `400/25` press spring — this is for a one-off emphasis moment, not a repeated tap)
- **Entrance**: `initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}`
- **Reference implementation**: `components/flow/ConfirmationStep.tsx`'s success-icon `successPop` variant — see §3D.
- Reserve this for genuinely celebratory/high-emphasis moments only; using it for routine state changes would cheapen it and fight the "no decorative fluff" rule in §4.

### Layout Transitions
- **Duration**: `0.2s` ~ `0.25s`
- **Ease**: `easeOut` or Spring `{ stiffness: 350, damping: 30 }`
- **Usage**: Cart item removal, quantity stepper layout shifts.

### Toast / Floating Element Transitions
- **Enter**: `initial={{ y: 20, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }}`
- **Exit**: `exit={{ y: 20, opacity: 0, scale: 0.96 }}`
- **Duration**: `0.2s`

---

## 3. Screen-by-Screen Transition Recipes

### A. Screen & Step Transition (Wizard Flow)
When transitioning between steps (e.g. Menu $\to$ Confirmation):
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={stepKey}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Real bug this caused, worth remembering**: don't put a Vaul/Radix-portaled overlay (`Drawer`, `Sheet`, `Dialog`) inside a branch this `AnimatePresence` controls if that overlay's own close action is what triggers the branch swap. `components/flow/MenuClientView.tsx` originally nested `CheckoutSheet` inside the "menu" branch — a successful order flips `orderStatus` (unmounting "menu") and closes the sheet in the same synchronous handler, pitting the outer unmount against the drawer's own close transition, and could leave it stuck open showing a stale, already-cleared cart. Fix: keep every sheet/drawer/toast as an unconditional sibling of the `AnimatePresence` block, not a descendant of one of its branches — each already self-gates via its own `open` prop, so it doesn't need to live inside whichever "screen" is active (see `CHANGELOG.md`'s Fixed entry for the concrete before/after).

### B. Interactive Buttons & Cards (TDS Tactile Feel)
All interactive cards (`ProductCard`, option selector buttons, action buttons) must provide pronounced spring press feedback — see §2's deepened content-control standard:
```tsx
<motion.div
  whileTap={disabled ? undefined : { scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="w-full"
>
  <Card ... />
</motion.div>
```

### C. Bottom Sheet / Drawer Transitions
- Driven by Radix + Vaul with CSS hardware-accelerated transforms.
- Bottom sheet drawer contents animate smoothly with `data-[vaul-drawer-direction=bottom]` translateY transitions.

### D. Staggered / Celebratory Sequences (Confirmation Step)
Replaced the prior GSAP timeline with Motion `variants` — a parent container orchestrates the stagger, each child gets the standard fade-rise, and the success icon gets the §2 celebratory spring-pop instead of the group's default:
```tsx
const receiptContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const receiptItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const successPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 15 } },
};

// confetti fires independently -- it was never actually animated *by*
// GSAP, only triggered from inside its callback -- so it's a plain effect:
React.useEffect(() => {
  if (reduceMotion || !lastReceipt) return;
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
}, [lastReceipt, reduceMotion]);

<motion.div initial={reduceMotion ? "visible" : "hidden"} animate="visible" variants={receiptContainer}>
  <motion.div variants={reduceMotion ? undefined : successPop}>{/* success icon */}</motion.div>
  <motion.div variants={reduceMotion ? undefined : receiptItem}>{/* receipt card */}</motion.div>
  <motion.div variants={reduceMotion ? undefined : receiptItem}>{/* CTA */}</motion.div>
</motion.div>
```

---

## 4. Accessibility & Reduced Motion Strict Standard

1. **Zero-Duration Fallback**: When `useAccessibilityStore.getState().reducedMotion` is `true`, all Motion transitions must immediately set `duration: 0` (or skip their `variants` entirely, per §3D's pattern), and all whileTap scales must remain `1`.
2. **Lenis Gating**: `<ReactLenis>` is conditionally rendered or stopped when `reducedMotion` is enabled, preventing scroll hijacking for screen reader and motion-sensitive users.
3. **No Decorative Fluff**: Animations serve purely as visual confirmation of state changes (tactile touch, addition to cart, confirmation) and must never delay the user's ability to interact with the interface.
