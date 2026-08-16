# Animation & Interaction Standards Guide

This document establishes the official animation, transition, and micro-interaction standards for Jumun.

---

## 1. Library Roles & Division of Responsibility

| Library | Role | Usage |
|---|---|---|
| **Motion (`motion/react`)** | Declarative Component & UI Interactions | Button/card press physics (`whileTap`), step-to-step wizard transitions (`AnimatePresence`), list layout reflow (`layout` prop), toast enter/exit, and bottom sheet content motion. |
| **GSAP (`gsap` + `@gsap/react`)** | Complex Imperative Timelines | Order confirmation receipt reveal, celebratory confetti choreography, and multi-node timeline sequences. |
| **Lenis (`lenis`)** | Global Momentum Smooth Scrolling | Natural touch/wheel scroll momentum across the entire menu and pages, gated by `useLenisMotionSync`. |

---

## 2. Standard Motion Parameters

### Spring Physics (Touch & Press Feedback)
- **Stiffness**: `400`
- **Damping**: `25`
- **Mass**: `1`
- **Press Scale**: `0.97` ~ `0.98` (Tactile feedback without excessive deformation)

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  ...
</motion.button>
```

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

### B. Interactive Buttons & Cards (TDS Tactile Feel)
All interactive cards (`ProductCard`, option selector buttons, action buttons) must provide subtle spring press feedback:
```tsx
<motion.div
  whileTap={disabled ? undefined : { scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="w-full"
>
  <Card ... />
</motion.div>
```

### C. Bottom Sheet / Drawer Transitions
- Driven by Radix + Vaul with CSS hardware-accelerated transforms.
- Bottom sheet drawer contents animate smoothly with `data-[vaul-drawer-direction=bottom]` translateY transitions.

### D. Complex Timeline Sequences (Confirmation Step)
- Uses GSAP timeline scoped via `@gsap/react`'s `useGSAP`:
```tsx
useGSAP(
  () => {
    if (reduceMotion) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    gsap.from(".receipt-card", {
      y: 40,
      opacity: 0,
      duration: 0.4,
      ease: "power3.out",
      stagger: 0.08,
    });
  },
  { scope: containerRef }
);
```

---

## 4. Accessibility & Reduced Motion Strict Standard

1. **Zero-Duration Fallback**: When `useAccessibilityStore.getState().reducedMotion` is `true`, all Motion transitions must immediately set `duration: 0`, all whileTap scales must remain `1`, and GSAP animations must complete instantaneously without animation.
2. **Lenis Gating**: `<ReactLenis>` is conditionally rendered or stopped when `reducedMotion` is enabled, preventing scroll hijacking for screen reader and motion-sensitive users.
3. **No Decorative Fluff**: Animations serve purely as visual confirmation of state changes (tactile touch, addition to cart, confirmation) and must never delay the user's ability to interact with the interface.
