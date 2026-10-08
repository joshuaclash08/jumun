# 0015 — Wizard Order Flow and One-Handed Operating Mode

**Status:** Accepted  
**Date:** 2026-10-09  

## Context

The default ordering experience in JUMUN presents a comprehensive catalog view (`MenuClientView.tsx`) with category tabs, 2-column full-bleed photography cards or 1-column lists, carousels, search, and bottom sheets. While accessible (meeting WCAG 2.2 AA/AAA with large touch targets and high contrast), this presentation imposes high cognitive load on certain user groups:
1. **Cognitive & Attention Constraints / Elderly Users**: Simultaneous choices across multiple categories, options, and actions can create decision paralysis.
2. **Motor Impairments / Hemiplegia / Post-Stroke Users**: Holding large modern smartphones (390px~430px wide) with one hand makes reaching controls across both sides of the screen physically challenging or impossible.

## Decision

1. **Wizard Sequential Order Mode (`WizardOrderView.tsx`)**:
   - Implemented an alternative 4-step linear flow adhering to the principle: *"한 화면에 하나의 선택만 제시" (Present only one choice per screen)*:
     - **Step 1 (Category)**: Choose menu category from large vertical cards (`WizardCategoryStep.tsx`).
     - **Step 2 (Product)**: Choose menu item filtered by selected category (`WizardProductStep.tsx`).
     - **Step 3 (Options & Stepper)**: Customize options via unified `OptionGroupList` and adjust quantity via `QuantityStepper` (`WizardOptionStep.tsx`). Users can either proceed directly to checkout or add more items.
     - **Step 4 (Summary & Payment)**: Review order summary and select payment method via reusable `SelectionCard` (`WizardCheckoutStep.tsx`).
   - Integrated client-side Web Speech API TTS guidance (`useVoiceGuide.ts`) narrating step transitions, options, quantity changes, and payments in Korean and English.
   - Decomposed into 4 modular subcomponents under `components/flow/wizard/` with barrel re-exports (`components/flow/wizard/index.ts`).

2. **OS Keyboard-Style One-Handed Mode (`OneHandedContainer.tsx`)**:
   - Inspired by mobile OS one-handed keyboard modes (iOS / Android / iPadOS), compresses the content lane to ~82% width docked to the active hand (`left` or `right`).
   - Features a dedicated ~18% gutter rail housing a flip direction button (`ArrowLeft` / `ArrowRight`) and a full-width restore button (`Maximize2`).
   - Managed globally via `useAccessibilityStore.ts` (`oneHandedMode: "none" | "left" | "right"`), persisting across sessions and shared between standard and wizard order views.

## Consequences

- Users with cognitive fatigue or one-handed motor constraints can place complete orders independently without feeling overwhelmed or physically strained.
- Order mode (`standard` vs `wizard`) and one-handed mode (`none` vs `left` vs `right`) are configurable at any time in `/settings`.
- Reuses core building blocks (`OptionGroupList`, `SelectionCard`, `QuantityStepper`, `useVoiceGuide`) preventing logic fragmentation.
- Automated tests in `tests/unit/wizard.test.tsx` verify step progression, one-handed alignment classes (`.mx-auto`, `.mr-auto.self-start`, `.ml-auto.self-end`), multi-item accumulation, and WCAG accessibility standards.
