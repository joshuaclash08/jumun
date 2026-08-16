# Features — Phase 1 MVP Screen Flow

This document describes the screen-by-screen flow for the Phase 1 prototype, reflecting the four resolved decisions in `docs/decisions/`. It's concrete enough to build from, but doesn't specify final UI copy.
## Flow overview

```
Entry (QR/NFC scan, table already known)
  │
  │  Entry (manual "직접 매장 선택하기"): order-type choice ──→ dine-in only: table picker
  │                                    └─→ takeout: skip straight to menu ──┘
  ▼
Menu browsing ──→ Product detail (bottom sheet with overlaid back button) ──→ back to Menu (item added)
      │                                                                               │
      │  (cart pill visible throughout, tap to open)                                  │
      ▼                                                                               ▼
    Cart review (bottom sheet) ──→ Checkout (dine-in/takeout shown read-only) ──→ Confirmation (large hero order number)
                                                                                  │
                                                                       ┌──────────┴──────────┐
                                                                       view receipt      order again → Menu

Settings (reachable from HeaderBar / landing links, never gating)
Staff Call (persistent floating action button for dine-in, opens two-step confirmation drawer)
```

There is no disability-select gate and no mandatory pre-order step beyond arriving via a valid link (`docs/decisions/0001-onboarding-model.md`).

## 1. Entry

- QR/NFC route: `/order/[storeId]?table={n}`, per `docs/architecture.md`. The physical tag at the table carries both a QR code and an NFC chip encoding this same URL — scanning or tapping either lands here identically (`PRODUCT.md`), skipping straight to menu browsing below.
- Manual entry route (home screen's "직접 매장 선택하기" list, for visitors who didn't scan a tag): `/order/[storeId]` with no query params. This renders a dine-in-vs-takeout choice (`components/flow/OrderTypeSelectView.tsx`). Choosing 포장 (takeout) resolves the menu immediately (`?type=takeout`, no table involved); choosing 매장 식사 (dine-in) goes to a dedicated table-number screen, `/order/[storeId]/table` (`components/flow/TableSelectView.tsx`), which then resolves the same `?table={n}` URL the QR/NFC path uses. See `docs/decisions/0014-entry-order-type-and-table-selection.md`.
- Renders usable content immediately — no splash screen, no "loading your accessible experience" theater, no install prompt of any kind.
- On arrival, accessibility settings from `useAccessibilityStore` apply immediately if this device has used Jumun before, at *any* venue — contrast mode, font scale, reduced motion, language, and haptics all carry over automatically (`PRODUCT.md`'s Operating Context; `docs/architecture.md`'s state shape).
- If `storeId` itself is missing or invalid, show the invalid-link empty state (`components/flow/InvalidOrderLinkNotice.tsx`) rather than a hard error.
- **Motion**: content fades/settles in on first paint (Motion, ~200ms). Collapses to an instant appearance when `reduceMotion` is on.

## 2. Menu browsing (core screen)

- Category switcher (`components/flow/MenuCategoryHeader.tsx`) at the top with CSS edge-fade mask; product grid below in a 2-column large card grid (`components/flow/ProductCard.tsx`).
- Full-bleed real food/beverage photography (`next/image` + `public/images/menu/*.jpg`, per `docs/decisions/0013-menu-photography.md`) with a liquid-glass info panel and subtle backdrop-blur.
- Top recommendation carousel (`components/flow/FeaturedMenuSection.tsx`) with "인기 메뉴" numbered badges (1, 2, 3위) and fast item selection.
- Search fallback section (`components/flow/MenuSearchSection.tsx`) allowing instant Hangul/choseong search (`es-hangul`).
- Tapping a card opens a bottom-sheet product detail (`components/flow/ProductDetailSheet.tsx`):
  - Overlaid circular back button on top-left of the hero image stage.
  - Option groups with "필수" badges directly beside group titles, clean price delta labels (`+500원`, omitting redundant `추가금 없음` text).
  - Maximum selection enforcement (`maxSelections`) with accessible toast alert when limits are exceeded.
  - Quantity stepper (`-` / `+`) and a progressive blur fixed bottom action bar with `RollingPrice` animation.
- A floating cart-status pill (`components/flow/CartSummaryPill.tsx`) displays item count and running total.
- Dine-in orders feature a floating Staff Call button (`components/flow/StaffCallButton.tsx`) at bottom-left; takeout orders expand the cart pill to full width (`reserveStaffCallSpace={false}`).

## 3. Cart review

- Opens as a bottom sheet (`components/flow/CartDrawer.tsx`) from the cart-status pill.
- Line items with readable names, option summaries, quantity adjustments (+/-) and removal; removal triggers an undo toast with "실행 취소" action.
- Running total updates live via `RollingPrice`.
- Fixed bottom CTA with progressive blur mask advances to Checkout.
- **States**: empty cart shows an illustrated empty state with a direct return CTA.

## 4. Order type + checkout

- Dine-in vs. takeout is decided during Entry, and checkout (`components/flow/CheckoutSheet.tsx`) displays this as a read-only badge.
- Mocked payment method selector (Credit/Debit Card vs. Easy Pay, seeded from `usePaymentStore`).
- 결제하기 (Pay) primary CTA triggers mocked submission with artificial latency, with deterministically testable error simulation and preserved cart state.

## 5. Confirmation

- Large hero order number display (4xl/5xl font size) as the primary focal point.
- Itemized receipt card with store name, table/takeout badge, formatted timestamp, item options, and total price.
- Celebratory spring animation with `canvas-confetti` (disabled under `reduceMotion`).
- Sticky bottom "새로운 주문하기" CTA button resetting session state cleanly back to the menu.

## 6. Staff Call (직원 호출)

- Fixed bottom-left floating action button for dine-in orders (`StaffCallButton.tsx`).
- Opens a dedicated two-step bottom drawer:
  1. **Idle State**: Displays "직원을 호출할까요?", table number badge, and side-by-side "취소" / "호출하기" buttons.
  2. **Success State**: Smooth cross-fade transition showing an animated checkmark graphic, green table badge, "호출이 완료되었어요!" title, and a single "확인" dismiss button.
- Triggers haptic feedback and live-region announcements.

## 7. Settings (reachable anytime, never gating)

A dedicated `/settings` route with clean text-only layout and accessible Radix checkboxes (`components/ui/checkbox.tsx`):

- **화면 및 텍스트 상세 설정**: 글자 크기 (3-way segmented pill), 고대비 모드, 난독증 친화 간격, 애니메이션 줄이기.
- **피드백 및 편의**: 진동 피드백, 알림 표시 시간 2배 연장.
- **기본 결제 수단 관리** (`/settings/payment`): 신용/체크카드 vs 간편결제 선택.
- **언어 및 초기화**: 한국어/English 및 원터치 설정 초기화.
- Bottom "설정 완료" button with progressive blur background mask for effortless return.

## Cross-cutting, not a screen

- **Native screen reader support** (VoiceOver / TalkBack) via correct semantic HTML and ARIA applies to every screen above, from the start (`docs/decisions/0004-voice-scope.md`).
- **Accessibility settings follow the person, not the venue.** Confirmed in `PRODUCT.md`: settings persist per-device across every Jumun session at every venue. A returning user never re-configures anything — only store/table context changes per scan.
