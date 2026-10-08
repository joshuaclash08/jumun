# Testing Strategy

This document details the automated and manual testing standards for the JUMUN platform.

## Test Suite Inventory (Vitest + RTL + vitest-axe)

All unit and component tests reside in `tests/unit/`. The current test suite comprises **12 test files and 126 automated tests passing at 100%**.

| Test File | Test Count | Scope & Coverage |
|---|---|---|
| **`components.test.tsx`** | 40 | Menu browsing, ProductCard layout variants, ProductDetailSheet option limits (`maxSelections`), HeaderBar navigation, StaffCallButton 6-option drawer & checkmark state, OptionGroupList segmented chips & checkboxes, QuantityStepper, and axe-core accessibility checks. |
| **`setupFlow.test.tsx`** | 16 | Setup onboarding wizard (`/setup`), SetupGuard route interception, cookie/localStorage persistence, and `returnTo` search parameter sanitization and restoration. |
| **`settings.test.tsx`** | 12 | Settings toggles (high contrast, dyslexia spacing, motion, haptics), FontScaleSelector, LanguageSelector, ThemeModeSelector, MenuLayoutSelector, OneHandedModeSelector, Recent Order receipt card, and zero axe-core violations. |
| **`i18n.test.ts`** | 11 | Core translation engine (`t()` and `translate()`), parameter interpolation, fallback to base locale (`ko`), and dictionary integrity across all namespaces. |
| **`wizard.test.tsx`** | 10 | 4-step wizard order flow (Category $\to$ Product $\to$ Options $\to$ Payment), step transitions, backward navigation, and OneHandedContainer flip/expand controls. |
| **`theme.test.tsx`** | 7 | Theme modes (System, Light, Dark, High Contrast AAA), DOM class synchronization (`.dark`), and OS media query detection. |
| **`useToastStore.test.ts`** | 7 | Toast queuing, auto-dismiss timers, clear actions, and variant options. |
| **`useCartStore.test.ts`** | 6 | Cart item quantity arithmetic, unit price summation, undo history stack (push/pop/cap at 5), and cart reset actions. |
| **`useAccessibilityStore.test.ts`** | 6 | Accessibility settings merge logic, persistence to `localStorage`, and reset to default values. |
| **`OrderService.test.ts`** | 6 | Order placement simulation, mocked latency, subtotal calculation, order number generation, and deterministic failure branches (`forceFailure`). |
| **`A11yToastContainer.test.tsx`** | 3 | Toast container portal rendering to `document.body` and dynamic bottom margin clearance when Vaul drawers are active. |
| **`foundation.test.tsx`** | 2 | Pretendard font variables, design tokens, and core layout rendering. |

---

## Automated Accessibility Checks (`vitest-axe`)

Automated accessibility audits are integrated directly into component tests (`tests/unit/settings.test.tsx`, `tests/unit/components.test.tsx`):
- Powered by `vitest-axe` (built on axe-core).
- Verifies WCAG 2.2 AA / AAA compliance mechanically:
  - Color contrast ratios ($\ge 4.5:1$ standard, $\ge 7:1$ high contrast).
  - ARIA attributes, roles, and accessible names.
  - Interactive element semantics and button labelling.
- **Policy**: An axe violation is treated as a **build-breaking test failure**, never ignored or suppressed.

---

## Internationalization Parity Validation (`bun run i18n:check`)

Run via `bun scripts/check-i18n.ts`:
- Validates 100% key parity between English (`en`) and Korean base (`ko`) dictionaries across all 6 namespaces (`common`, `landing`, `menu`, `orderFlow`, `settings`, `setup`).
- Fails the build if any translation key is missing or orphaned in any locale.

---

## Manual QA Protocols

Automated checks verify mechanics, but manual testing validates the lived human experience.

### 1. Screen Reader Verification (VoiceOver & TalkBack)
- **iOS Safari (VoiceOver)** & **Android Chrome (TalkBack)** on real devices.
- Navigate the full flow with the screen dimmed:
  1. Entry $\to$ Table selection $\to$ Menu browsing.
  2. Option selection in ProductDetailSheet or WizardOrderView.
  3. Cart review and simulated checkout.
  4. Staff call request and confirmation.
- Ensure every announcement is a coherent, complete Korean or English sentence.

### 2. Keyboard & Switch Navigation
- Tab through every interactive control.
- Ensure the 2px Toss Blue focus ring is prominently visible at all times.
- Ensure roving tabindex works as expected in `MenuCategoryHeader` and radio groups.

### 3. Motion & Low-End Device Testing
- Toggle `reducedMotion` in settings: verify that all spring physics, confetti, and transitions collapse instantly.
- Test on iOS 15 / iPhone 6s or throttled CPU to confirm 60fps scrolling without stutter.
