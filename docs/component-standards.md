# Component Standards

This document is the prescriptive layer on top of `DESIGN.md` (tokens) and `docs/design-system.md` (token↔accessibility translation): given those tokens, here is the concrete standard every component of a given archetype should follow — sizes, spacing, states, and the specific inconsistencies found in a full-codebase audit (August 2026) that this document exists to prevent from recurring. Where the current code doesn't yet match the standard below, that's flagged explicitly rather than silently assumed fixed — see `docs/ux-planning-2026-08.md` for the fix-it-or-not judgment calls on each one.

---

## 1. Product Photography Cards & Card Geometry

As established in `docs/decisions/0013-menu-photography.md`, the catalog renders in a **2-Column Full-Bleed Photo Card Grid with Fluid Vertical Title Auto-Expansion** (`grid grid-cols-2 gap-3 sm:gap-4`):

| Context | Container / Aspect | Imagery Source | Card Treatment | Where |
|---|---|---|---|---|
| Menu 2-column card | **`aspect-[4/3] w-full`**, `rounded-[20px]` | Real photo (`next/image`) | Full-bleed photo, liquid-glass info panel, fluid auto-height | `ProductCard.tsx` |
| Product detail hero stage | **`h-56 sm:h-64 w-full`**, `rounded-[24px]` | Real photo (`next/image`) | Hero photo with overlaid top-left back button | `ProductDetailSheet.tsx` |
| Featured/carousel card | **`w-40 shrink-0`**, `rounded-[20px]` | Real photo (`next/image`) | Full-bleed photo, numbered ranking badge | `FeaturedMenuSection.tsx` |
| Empty/celebratory states | **80–120px**, `rounded-[22–24px]` | Vector illustration (`TossIllustrations.tsx`) | Vector art on soft surface | `CartDrawer.tsx`, `StaffCallButton.tsx`, `ConfirmationStep.tsx` |

### Card Outline & Image Background Standard
- **Full-bleed photography**: Photos fill their container completely with `object-cover`.
- **Liquid-glass info panel**: Info panel uses a semi-transparent theme tint (`themeBg` hex with 30% alpha), `backdrop-blur-sm`, and a top fade mask (`mask-image: linear-gradient(to top, black 30%, transparent 100%)`).
- **Fluid Vertical Title Auto-Expansion**: Product names wrap naturally without truncation (`break-keep`, `line-clamp-none`).
- **Desaturated sold-out treatment**: Sold-out products use `grayscale opacity-60` with a prominent "품절" badge.

---

## 2. Universal Navigation & Buttons

### Universal Top-Left `<` (ChevronLeft) Back Navigation
Every sub-screen, page, and drawer overlay (`HeaderBar`, `SettingsHeader`, `ProductDetailSheet`, `CartDrawer`, `CheckoutSheet`, `StaffCallButton`, `QrScannerModal`) features a standardized **Top-Left `<` Back Button**:
- Target: **40×40px or 44×44px circular**, `variant="ghost" size="icon"`.
- Icon: **`ChevronLeft` (`stroke-[2.5]` or `stroke-[2.8]`)** for strong, prominent legibility.
- Motion: `whileTap={{ scale: 0.90 }}` spring physics.

### HeaderBar Standard
`HeaderBar.tsx` renders a 3-column grid (`grid grid-cols-[40px_1fr_40px]`):
- Left: 40×40px circular back button with `ChevronLeft`.
- Center: Store name and table/takeout pill badge.
- Right: Balanced spacer to preserve perfect center alignment.

### Category Navigation Bar with CSS Edge Fade Mask
`MenuCategoryHeader.tsx` is `sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md py-2.5`. It uses a CSS gradient mask (`mask-image: linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)`) so category pills smoothly dissolve at both edges.

### Fixed Bottom-Left Staff Call Button (Two-Step Drawer)
`StaffCallButton` is fixed at the bottom-left (`fixed bottom-5 left-4 z-50`) for dine-in orders:
- Triggers a dedicated two-step drawer: idle confirmation ("직원을 호출할까요?") → animated checkmark success state ("호출이 완료되었어요!").
- Fully accessible with live announcements and haptics.

### Checkbox Primitive for Settings & Lists
`components/ui/checkbox.tsx` provides an accessible Radix-based checkbox primitive styled with Toss tokens:
- Three sizes (`sm: 20px`, `default: 24px`, `lg: 28px`) with high-contrast check indicators.
- Used in `/settings`, `/settings/accessibility`, and `/settings/payment` for clean, text-only option selection without decorative icon noise.

---

## 3. Settings rows and cards — pick one pattern, stop duplicating

Three near-identical "selectable option row" implementations currently exist:
- **`SettingsRow`** (`components/settings/SettingsRow.tsx`): 44px icon chip (`rounded-[14px]`), `text-base` label, `min-h-[64px]`.
- **`SettingsCard`** (same file): 48px icon chip (`rounded-[18px]`), `text-lg` label, standalone card with `ring-2 ring-primary/20` selected state.
- **Bespoke `motion.button` markup in `app/settings/payment/page.tsx`**: 48px icon chip (`rounded-[18px]`), `text-lg` label, `h-6 w-6` trailing radio circle — reimplements ~90% of `SettingsCard` from scratch rather than importing it.

**Standard going forward:**
- **`SettingsRow`** is for a row inside a `SettingsGroup` (toggle switches, chevron-linked sub-pages) — keep its 44px/`text-base` sizing, it's already consistent with every other 44px icon affordance in the app (§2).
- **`SettingsCard`** is for a standalone selectable option outside a group (the 4 quick-presets, and — going forward — the payment-method picker). Its 48px/`text-lg` sizing is a deliberate, larger step for "this is a bigger decision than a toggle," not an accidental drift from `SettingsRow` — keep both sizes, but only these two.
- **`app/settings/payment/page.tsx`'s bespoke markup should be replaced with `SettingsCard`** the next time that file is touched — same visual result, one implementation instead of two to keep in sync.

---

## 4. Overlay primitives — Drawer is the only one in active use

The complete popup/overlay surface today: **5 bottom sheets, all via `components/ui/drawer.tsx`** (`ProductDetailSheet`, `CheckoutSheet`, `CartDrawer`, `StaffCallButton`'s confirm, `QrScannerModal`), **1 custom top-anchored toast** (`A11yToastContainer.tsx`, not a shadcn primitive), and **1 sr-only live region** (`LiveRegionAnnouncer.tsx`).

**`components/ui/sheet.tsx` and `components/ui/dialog.tsx` have zero usage anywhere in the app.** Despite two components being *named* `ProductDetailSheet`/`CheckoutSheet`, both render `Drawer`, not `Sheet`. Standard: **`Drawer` is this product's one bottom-sheet primitive — don't reach for `Sheet` or `Dialog` for a new overlay without a specific reason.** `Sheet`/`Dialog` staying in the tree unused is a judgment call for `docs/ux-planning-2026-08.md` (remove as dead code vs. keep in reserve for a genuine centered-modal need — the app currently has *no* true centered-modal/confirm-dialog pattern anywhere, including for destructive actions like cart-item removal, which fires immediately with only a toast+undo).

---

## 5. Toast — single-toast-only, top-anchored

`A11yToastContainer.tsx` only ever renders the *newest* toast (`toasts[toasts.length - 1]`); older queued toasts are silently superseded, not stacked or sequenced. This is an intentional simplicity choice, not a bug — **keep it this way**: a stacking multi-toast UI adds real complexity (positioning, max-visible limits, staggered dismiss timers) that this product's actual toast volume (cart add/remove, staff-call confirm) doesn't need. If a future feature pushes toast volume up, revisit as a deliberate decision, not an incremental patch.

- **Position**: top-anchored (`top-[calc(env(safe-area-inset-top,0px)+1rem)]`), centered, `max-w-md`.
- **Auto-dismiss**: 3200ms default, 7000ms when the user's `timeoutExtension` accessibility setting is on.
- **No collision** with the bottom-anchored `CartSummaryPill` today (opposite viewport edges) — if a future toast or the pill ever grows tall enough to threaten overlap, that's the trigger to revisit, not a currently-live bug.

---

## 6. Radius authoring — literal `[Npx]`, not `--radius-*` var, at the component level

Two authoring styles currently coexist for the same visual outcome: literal arbitrary values (`rounded-[14px]`, `rounded-[22px]` — the large majority) and the CSS custom-property reference (`rounded-[--radius-md]` — used only in `SettingsHeader.tsx`'s back button and a couple of legacy spots). **Standard: use the literal `rounded-[Npx]` form**, at or near one of `DESIGN.md`'s seven anchor values (6/10/14/20/26/32/9999) — "near" is intentional here, not sloppy: several redesigned cards/sheets hand-tune to an intermediate literal (18, 22, 24px) for fine visual weight rather than snapping to the nearest anchor exactly, and that's an accepted part of this scale's authoring convention, not drift to fix. The `--radius-*` custom properties still exist in `app/globals.css` and remain the source of truth for the *anchor* values — component code should hardcode the resolved px value at each call site (as most of the app already does) rather than mixing in live var references, so a future token change is a deliberate, greppable find-and-replace across literal values instead of an invisible one at the handful of var-reference sites.

---

## 7. Border opacity — pick from this list, not ad hoc

Sticky headers and card borders currently use `border-border`, `border-border/40`, `border-border/60`, and `border-border/80` in different places with no documented rule for which. Standard, going forward:
- **`border-border`** (full opacity): default for cards and resting surfaces (`Card`'s own border, per `docs/decisions/0008`'s Border-and-Shadow Rule).
- **`border-border/40`**: sticky header bottom-borders (`HeaderBar`, `MenuCategoryHeader`, `SettingsHeader`) — a lighter separator appropriate for a persistent chrome element that shouldn't visually compete with content.
- **`border-border/60`**: dividers inside a grouped list (`SettingsGroup`'s `divide-y`).
- Retire `border-border/80` — audit found only one call site (a settings icon button); fold it into full `border-border` unless a specific new need justifies a fourth opacity step.

---

## 8. Arbitrary Tailwind values — verify against the real scale before shipping

Two spacing values found in the audit don't correspond to Tailwind's default scale and may silently no-op depending on how the project's `@theme` block is configured: **`w-38`** (`FeaturedMenuSection.tsx`, intended ~152px) and **`h-13`** (`LandingClientView.tsx`, intended ~52px). **Before reusing either pattern elsewhere, confirm in a real browser (computed style, not just visual guess) that they resolve to the intended pixel value** — if either is a no-op, replace with an explicit `w-[152px]`/`h-[52px]` arbitrary value, which always works regardless of scale configuration. This is a verify-don't-assume item for `docs/ux-planning-2026-08.md`, not something to silently "fix" by guessing which behavior is intended.

---

## 9. Motion

Full spec lives in `docs/animation-guide.md` — this section only cross-references the parts most relevant to component authoring, don't duplicate the source of truth here:
- Press feedback: `scale: 0.96` for content controls, `scale: 0.90` for icon/chip controls (`docs/decisions/0010-deeper-press-feedback.md`).
- Celebratory/high-emphasis entrances (success states, not routine ones): the `successPop` spring pattern (`stiffness: 300, damping: 15`), reserved for genuinely celebratory moments only.
- One true screen-to-screen transition exists in this app (menu ↔ confirmation) — everything else is a `Drawer` sheet over the menu, which gets its motion from Vaul/Radix, not a custom `AnimatePresence` recipe.
