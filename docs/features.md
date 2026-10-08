# Features — Phase 1 MVP Screen Flow

This document describes the complete screen-by-screen flow and feature inventory for the JUMUN platform.

## Flow overview

```
Entry (QR/NFC scan, table already known) ────────┐
                                                  ▼
Entry (manual "직접 매장 선택하기"): order type ──→ dine-in: table picker ──→ Menu Browsing
                               └─→ takeout: skip straight to menu ───────┘        │
                                                                                 │
Onboarding (/setup): first-time accessibility setup ──→ return to destination ───┘
                                                                                 │
┌───────────────────────────────── Dual Order Modes ─────────────────────────────┴─────────────────┐
│                                                                                                  │
│ [Standard Browsing Mode]                                      [Wizard Order Mode]                │
│   Menu browsing (2-col grid / 1-col list)                       Step 1: Category Selection       │
│     │                                                             │                              │
│     ├──→ Product detail (bottom sheet via OptionGroupList)        Step 2: Product Selection      │
│     │      │                                                      │                              │
│     │      └──→ Add to cart                                       Step 3: Option Configuration   │
│     │                                                             │                              │
│     ├──→ Cart review (bottom sheet)                               Step 4: Summary & Payment      │
│     │      │                                                      │                              │
│     │      └──→ Checkout sheet ───────────────────────────────────┼──────────┐                   │
│     │                                                             │          │                   │
└─────┴─────────────────────────────────────────────────────────────┴──────────┼───────────────────┘
                                                                               ▼
                                                                Order Confirmation Step
                                                                  (large hero order number,
                                                                   itemized receipt, confetti)
                                                                               │
                                                                     ┌─────────┴─────────┐
                                                                     view receipt    order again

Persistent / Cross-cutting Surfaces:
- Staff Call: persistent floating action button for dine-in, opens 6-item quick request drawer
- One-Handed Layout: OS keyboard style thumb-zone narrowing (left/right alignment with flip/expand)
- Settings (/settings): reachable anytime via HeaderBar, persists preferences across venues
```

---

## 1. Entry & Onboarding

- **QR/NFC Direct Route**: `/order/[storeId]?table={n}`. Scanning the physical tag at the table encodes store and table information directly, immediately rendering the menu.
- **Manual Entry Route**: `/order/[storeId]` (reached via the home screen "직접 매장 선택하기" list).
  - Prompts for order type (`OrderTypeSelectView`): 매장 식사 (dine-in) or 포장 (takeout).
  - Choosing 포장 advances straight to `/order/[storeId]?type=takeout`.
  - Choosing 매장 식사 advances to `/order/[storeId]/table` (`TableSelectView`), displaying a clear grid of numbered table buttons before resolving the menu.
- **First-Time Setup Onboarding (`/setup`)**:
  - Managed by `SetupGuard`. Unconfigured first-time users can visit `/setup` to customize their accessibility preferences (font scale, high contrast, reduced motion, language).
  - Preserves `returnTo` search parameter, returning the user seamlessly to their original destination after setup completion.
- **Immediate Paint**: Renders without splash delay or artificial loading theater. Accessibility preferences from `useAccessibilityStore` apply immediately on first frame.

---

## 2. Menu Browsing (Standard Mode)

- **Category Navigation (`MenuCategoryHeader.tsx`)**:
  - Horizontal scrollable tablist with CSS edge-fade mask.
  - Active tab indicated by a GPU-accelerated pill (`translate3d` + width transition) with pre-cached tab coordinates to prevent layout thrashing on low-end mobile devices (e.g. iPhone 6s).
  - WAI-ARIA roving tabindex keyboard navigation (ArrowLeft / ArrowRight / Home / End).
- **Featured Menu Recommendations (`FeaturedMenuSection.tsx`)**:
  - Prominent horizontal carousel showcasing top items with numbered rank badges (1, 2, 3위).
- **Display Layout Toggle (`MenuLayoutSelector`)**:
  - Supports 2-column full-bleed photography cards (`ProductCard.tsx`) with liquid glass panels, or a high-density 1-column accessible row list.
- **Live Search Fallback (`MenuSearchSection.tsx`)**:
  - Instant search supporting Korean initial consonant search (초성 검색: "ㅇㅁㄹㅋㄴ" $\to$ "아메리카노") via `es-hangul`.
- **Floating Bottom Bar**:
  - Dine-in: Displays the floating Staff Call button (`StaffCallButton.tsx`) alongside the dynamic Cart Summary Pill (`CartSummaryPill.tsx`).
  - Takeout: Automatically expands the Cart Summary Pill to full width.

---

## 3. Product Detail Sheet (`ProductDetailSheet.tsx`)

- Opens as an accessible bottom sheet upon selecting any menu item.
- **Hero Image & Navigation**: Full-bleed photo with top-left overlaid circular back button for one-touch dismissal.
- **Unified Option Groups (`OptionGroupList.tsx`)**:
  - Small single-choice groups ($\le 4$ options): Rendered as a tactile 2-column segmented chip grid.
  - Multi-choice or large groups: Rendered with accessible checkboxes and clear price deltas (`+500원`).
  - Required options highlighted with "필수" badges; optional groups indicated to assistive technologies via screen-reader text.
  - Max selection enforcement (`maxSelections`) with accessible toast alert when exceeded.
- **Quantity Stepper (`QuantityStepper.tsx`)**:
  - Generous 44px+ touch targets with tactile spring feedback.
- **Action Bar**:
  - Fixed progressive blur bottom bar featuring `RollingPrice` real-time animated total and primary "장바구니 담기" CTA.

---

## 4. Cart Review (`CartDrawer.tsx`)

- Opens from the floating Cart Summary Pill.
- Displays line items with product names, selected option tags, and individual quantity steppers.
- **Item Removal & Undo**: Removing an item immediately triggers an undo toast with a 4-second "실행 취소" action window.
- **Summary & Checkout CTA**: Live price calculation via `getCartTotals` and direct checkout advancement.

---

## 5. Checkout & Payment (`CheckoutSheet.tsx`)

- Displays read-only order context badge (매장 식사 테이블 번호 or 포장).
- **Payment Method Selection**: Mocked credit/debit card vs easy pay selection, pre-seeded from `usePaymentStore`.
- **Submission**: Simulated checkout with artificial latency. Deterministic error testing path supported.

---

## 6. Order Confirmation (`ConfirmationStep.tsx`)

- Large hero order number display (4xl/5xl font size) as the primary focal point for pickup calling.
- Itemized receipt card with store name, dining badge, formatted timestamp, item options, and total price.
- Celebratory spring animation with `canvas-confetti` (automatically bypassed when `reduceMotion` is active).
- Sticky "새로운 주문하기" button cleanly resetting cart and session back to the menu.

---

## 7. Staff Call (`StaffCallButton.tsx`)

- Dedicated floating action button for dine-in orders.
- Opens a clean bottom drawer with 6 high-frequency multi-select request options:
  1. 물티슈 (Wet wipes)
  2. 앞치마 (Apron)
  3. 앞접시 (Extra plates)
  4. 영수증 (Receipt)
  5. 수저 (Utensils)
  6. 직원호출 (Call staff)
- Selecting options and confirming triggers an immediate success toast dynamically listing requested items (e.g., "3번 테이블로 물티슈, 앞치마을(를) 요청했어요.").
- The floating button transforms into a green/blue checkmark state with a 3.5-second cooldown timer.

---

## 8. Dedicated Settings (`/settings` & `/settings/payment`)

- **Screen & Display**:
  - **Language (`LanguageSelector.tsx`)**: Native OS select dropdown for instant 한국어 / English switching.
  - **Theme (`ThemeModeSelector.tsx`)**: System / Light / Dark / High Contrast (AAA 7:1+).
  - **Font Scale (`FontScaleSelector.tsx`)**: Interactive slider (100%, 115%, 130%, 150%) with live text preview card.
  - **One-Handed Mode (`OneHandedModeSelector.tsx`)**: Off / Left-hand / Right-hand thumb zone alignment.
  - **Order Mode (`OrderModeSelector.tsx`)**: Standard Browsing vs Wizard Step Mode.
  - **Menu Layout (`MenuLayoutSelector.tsx`)**: 2-Column Card Grid vs 1-Column Row List.
- **Accessibility & Motor Settings**:
  - High Contrast mode toggle.
  - Dyslexia-friendly line & letter spacing.
  - Reduced Motion toggle.
  - Haptic feedback toggle.
  - Alert display duration extension (2x).
  - Voice guide assistance.
- **Recent Order Card**:
  - Displays recent order number, store name, item count, total price, and "내역 삭제" reset button.
- **Payment Method Management (`/settings/payment`)**:
  - Default payment preference selector.

---

## 9. Wizard Order Flow (`WizardOrderView.tsx`)

Designed specifically for elderly users, cognitive-assistance needs, or users preferring zero information overload:
- **Step 1: Category Selection**: Prominent large cards for each menu category.
- **Step 2: Product Selection**: Large, single-column product cards with clear pricing and high-contrast titles.
- **Step 3: Option Configuration**: Inline option group selection using `OptionGroupList` and quantity stepper.
- **Step 4: Summary & Payment**: Consolidated order summary, payment method selection, and direct order completion.
- Includes step indicator ("1 / 4 단계"), previous-step navigation, and quick exit back to standard menu browsing.

---

## 10. One-Handed Layout Mode (`OneHandedContainer.tsx`)

- Optimizes reachability on large mobile devices by narrowing content width to 82%~85% and aligning it to the left or right side of the screen.
- **Side Controls**:
  - **Flip Button**: Instantly toggles between left-hand and right-hand alignment without visiting settings.
  - **Expand Button**: Temporarily expands the layout to full width.
