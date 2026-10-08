# Tech Stack

This document describes the active technology stack for JUMUN, why each library was chosen, and how responsibilities are divided.

## Core Runtime & Framework

| Library | Version | Role | Rationale |
|---|---|---|---|
| **Next.js** (App Router) | `16.3.1` (Turbopack) | Framework | App Router file-based routing, React Server Components compatibility, and clean future path toward React Native / Expo monorepo. Turbopack provides sub-second builds. |
| **React** | `19.2.8` | UI Library | Ships with Next.js 16. Compliant with React 19 compiler rules and modern hooks. |
| **TypeScript** | `^5` (strict) | Language | Strict type safety enforced across the entire codebase. Zero `ignoreBuildErrors`. |
| **Tailwind CSS** | `v4` | Styling | Consumes design tokens via `@theme` blocks inside `globals.css`. Direct CSS custom property binding with zero config file overhead. |
| **shadcn** (`--base radix`) | `^4.18.0` | UI Primitives | Accessible headless components generated on top of Radix Primitives and Tailwind v4. |

---

## Headless Primitives & Icons

| Library | Version | Role | Rationale |
|---|---|---|---|
| **Radix UI Primitives** | `^1.6.7` (unified `radix-ui`) | Accessible Primitives | Managed focus, WAI-ARIA states, and full keyboard navigation for dialogs, switches, tabs, and checkboxes. |
| **Vaul** | `^1.1.2` | Mobile Drawers | Native iOS/Android style swipeable bottom sheet drawers for product details, cart, and staff call. |
| **Lucide React** | `^1.31.0` | Icons | High-contrast, clean vector icons designed for accessibility. |

---

## State Management

| Library | Version | Role | Stores |
|---|---|---|---|
| **Zustand** | `5.0.15` | Global State | Fast, lightweight, React 19-compatible state management without provider boilerplate. Portable to Expo/React Native in Phase 2. |

### Active Stores (`/store`)
- **`useCartStore`**: Manages cart items, store info, order status, last receipt, and undo history stack.
- **`useAccessibilityStore`**: Manages user accessibility preferences (font scale, high contrast, theme, reduced motion, haptics, dyslexia spacing, one-handed mode, order mode, menu layout). Persisted to `localStorage`.
- **`usePaymentStore`**: Mocked default payment method preference (credit card vs easy pay).
- **`useToastStore`**: Unified accessible toast notification queue with dynamic auto-dismiss timers.

---

## Animation & Motion

| Library | Version | Role | Rules |
|---|---|---|---|
| **Motion** (`motion/react`) | `^13.1.0` | UI Motion & Transitions | Button/card press physics (`whileTap`), step-to-step wizard transitions (`AnimatePresence`), and layout reflow. Replaced legacy GSAP. |
| **Lenis** | `^1.3.26` | Momentum Scrolling | Smooth touch/wheel scrolling momentum for menu list containers. Gated behind `useLenisMotionSync`. |
| **canvas-confetti** | `^1.9.4` | Celebratory Visuals | Confetti explosion on order confirmation step. Automatically disabled when `reduceMotion` is true. |

**Zero-Motion Principle**: Every animation collapses instantly (`duration: 0` or disabled) when the user enables `reducedMotion` in accessibility settings or via OS preferences.

---

## Typography

| Font | Loading | Notes |
|---|---|---|
| **Pretendard Variable** | Self-hosted (`public/fonts/PretendardVariable.woff2`) via `next/font/local` | 1.3.9 variable font release. Self-hosted to prevent external CDN render-blocking requests. Configured with explicit `weight: '45 920'` for WebKit/Safari rendering precision. |
| **Noto Sans KR** | Fallback via `next/font/google` | Comprehensive CJK glyph fallback. |

---

## Korean Language & Utility Ecosystem

| Library | Version | Role | Notes |
|---|---|---|---|
| **`es-hangul`** | `^2.4.0` | Korean NLP & Search | Korean initial consonant search (초성 검색: "ㅇㅁㄹㅋㄴ" $\to$ "아메리카노") and Hangul particle affixing (`이/가`, `을/를`) for accessible screen-reader sentences. |
| **`clsx` + `tailwind-merge`** | `^2.1.1` / `^3.6.0` | Class Name Utilities | Standard `cn()` utility for merging Tailwind class names without specificity bugs. |

---

## Internationalization (i18n) Engine

Custom type-safe dictionary engine (`lib/i18n/`):
- 6 domain namespaces: `common`, `landing`, `menu`, `orderFlow`, `settings`, `setup`.
- Zero inline branching (`if (lang === 'ko') ...` is banned in UI code).
- Real-time `document.documentElement.lang` synchronization for screen reader voice engine adaptation.
- Automated 100% key parity verification CLI (`bun run i18n:check`).

---

## Browser Compatibility & Polyfills

To support older mobile hardware (specifically iPhone 6s running iOS 15 / Safari 15), JUMUN includes targeted polyfills in `lib/polyfills.ts`:
- `window.requestIdleCallback` / `window.cancelIdleCallback` fallback via `setTimeout`.
- `Object.hasOwn` fallback via `Object.prototype.hasOwnProperty.call`.
- Browserslist targets: `iOS >= 15`, `Safari >= 15`, `Chrome >= 90`.

---

## Testing & Quality Assurance

| Tool | Version | Role |
|---|---|---|
| **Vitest** | `^4.1.10` | Fast unit & component test runner natively paired with Vite and Next.js. |
| **@testing-library/react** | `^16.3.2` | Component tests queried by accessible role and label. |
| **vitest-axe** | `^0.1.0` | Automated axe-core accessibility violation audit; violations treated as build-breaking. |

Total test count: **12 test suites, 126 unit tests 100% PASSING**.
