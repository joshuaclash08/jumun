# 0001 — Onboarding model: accessible by default, no disability-select gate

**Status:** Accepted

## Context

Legacy's actual implementation (`legacy-reference/components/steps/Step1DisabilitySelect.tsx`) opens with a mandatory first screen offering two choices: "I need help" (routes into a disability-type selection wizard) or "I'm fine" (intended for non-disabled users). On inspection, the "I'm fine" path is a confirmed dead end:

```tsx
const handleNonDisabilityClick = () => {
  vibrate(20);
  speak("일반 화면입니다."); // "This is the normal screen."
};
```

It vibrates, speaks a sentence, and calls no navigation function and no callback prop. The button is also marked `aria-disabled="true"` while remaining clickable — so a screen reader announces it as disabled, yet tapping it "succeeds" and goes nowhere. For the majority of users (anyone not opting into the accessibility wizard), the app is unusable as shipped.

Separately, the project's newer accessibility/design spec (see `docs/design-system.md`) specifies universal minimums — contrast ratio, touch target size, focus ring visibility, absence of time pressure — with no mention of disability categories, profiles, or a selection step. That spec reads as a baseline for everyone, not an opt-in mode.

Legacy's own `docs/kiosk_standards.md` independently groups users into three *rendering-behavior* groups (linear-focus navigation / spatiotemporal resolution correction / cognitive load control) rather than raw diagnosis categories — implying the useful unit of design is "what does the interface need to do," which doesn't actually require asking the user to self-categorize by disability before they can order food.

## Decision

Jumun has no disability-select gate. Every user lands directly in the ordering flow. The full accessibility baseline (contrast, touch targets, focus rings, no timeouts, 18px+ type) is simply how the app looks and behaves for everyone, by default — not a mode that has to be turned on.

A small, persistent settings affordance (reachable from any screen, never blocking) opens a dedicated accessibility settings page for further personalization beyond the baseline: AAA/high-contrast toggle, font scale, reduced motion override, dyslexia-friendly spacing, haptics on/off, language.

## Consequences

- No user is ever asked to publicly self-categorize by disability before ordering — removes a dignity cost legacy's gate imposed on every single session.
- No dead-end path is possible by construction, because there's no branch to dead-end into.
- Legacy's "3 rendering-behavior groups" idea survives, just reframed: Group A's requirements (full keyboard/ARIA focus order) become correct markup applied everywhere, not a toggle. Group B's requirements (44px+ targets, strong contrast) become the default render. Group C's requirements (few choices per screen, no timeouts) become default flow constraints.
- Deeper personalization (AAA contrast, larger font, dyslexia spacing) is opt-in via settings rather than gated up front — nothing legacy offered is actually lost, it just moved.
- One-tap convenience presets (e.g., a single "low vision support" toggle that flips several settings at once) remain possible inside the settings page later, without reintroducing a mandatory first-screen gate.

## Alternatives considered

- **Keep a needs-select gate, fix the dead end.** Rejected — even with a working non-disabled path, this still forces every user through an extra step and a disability-disclosure decision before the core task (ordering), which conflicts with the cognitive-load-minimization principle legacy's own `kiosk_standards.md` states for exactly this kind of first screen.
- **Hybrid: accessible by default + a persistent "more options" banner.** A reasonable middle ground, functionally very close to the accepted decision. Not chosen only because it adds a permanent UI element with no clear behavior difference from a settings icon — may be revisited if user testing shows people don't discover the settings affordance on its own.
