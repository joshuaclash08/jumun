# Component Standards

This document is the prescriptive layer on top of `DESIGN.md` (tokens) and `docs/design-system.md` (token↔accessibility translation): given those tokens, here is the concrete standard every component of a given archetype should follow — sizes, spacing, states, and the specific inconsistencies found in a full-codebase audit (August 2026) that this document exists to prevent from recurring. Where the current code doesn't yet match the standard below, that's flagged explicitly rather than silently assumed fixed — see `docs/ux-planning-2026-08.md` for the fix-it-or-not judgment calls on each one.

---

## 1. Icon / illustration tiles & Card Geometry

Every product/illustration graphic (`components/ui/TossIllustrations.tsx`) sits seamlessly inside a card without separate tinted box containers. As of ADR 0012, the product catalog is rendered in a **2-Column Borderless Card Grid with Fluid Vertical Title Auto-Expansion** (`grid grid-cols-2 gap-3 sm:gap-4`):

| Context | Container / Tile size | Illustration `size` prop | Card Treatment | Where |
|---|---|---|---|---|
| Menu 2-column card | **`h-28 sm:h-34 w-full`**, `rounded-[18px]` | `62` | Borderless, bottom-to-top gradient fade, fluid vertical auto-height for titles | `ProductCard.tsx` |
| Product detail hero stage | **`h-52 sm:h-60 w-full`**, `rounded-[24px]` | `110` | Borderless, bottom gradient fade | `ProductDetailSheet.tsx` |
| Featured/carousel card | **`h-28 w-full`**, `rounded-[18px]` | `68` | Borderless, bottom gradient fade, fluid title | `FeaturedMenuSection.tsx` |
| Empty/celebratory states (empty cart, staff-call) | **96–120px**, `rounded-[22–24px]` | `80–120` | Clean illustration | `CartDrawer.tsx`, `StaffCallButton.tsx` |

### Card Outline & Image Background Standard
- **No outer card outline**: Cards use `border-none shadow-none` for a clean, seamless surface blending into the canvas.
- **No tinted box backgrounds**: Rather than enclosing images in a flat `#F9FAFB` box, images render seamlessly.
- **Fluid Vertical Title Auto-Expansion**: Fixed height clamping is removed (`break-keep`, `line-clamp-none`); when product titles span 2, 3, or more lines, the card smoothly auto-expands vertically.
- **Bottom-to-top gradient fade**: A progressive gradient (`from-card via-card/40 to-transparent`) spans the bottom section of the photo area, decreasing blur/opacity upwards to smoothly transition text into the crisp image.

---

## 2. Universal Navigation & Buttons

### Universal Top-Left `<` (ChevronLeft) Back Navigation — 48×48px Round
Every sub-screen, page, and drawer overlay (`SettingsHeader`, `ProductDetailSheet`, `CartDrawer`, `CheckoutSheet`, `StaffCallButton`, `QrScannerModal`) features a standardized **Top-Left `<` Back Button**:
- Target: **48×48px circular (`h-12 w-12 rounded-full`)**, `variant="ghost" size="icon"`.
- Icon: **`ChevronLeft` (`h-7 w-7 stroke-[2.8]`)** for strong, prominent legibility.
- Motion: `motion.div` with `whileTap={{ scale: 0.90 }}` spring physics.

### HeaderBar & Settings Button — Top Header
`HeaderBar.tsx` renders the store name, table badge, and a top-right **48×48px circular Settings button (`h-12 w-12 rounded-full border border-border shadow-2xs`)** with centered `22px` (`h-5.5 w-5.5`) icon.

### Category Navigation Bar with CSS Edge Fade Mask
`MenuCategoryHeader.tsx` is `sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md py-2.5`. It uses a CSS gradient mask (`mask-image: linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)`) so category pills smoothly dissolve at the left and right edges without abrupt box clipping or card bleed-through.

### Fixed Bottom-Left Staff Call Button
`StaffCallButton` is fixed at the bottom-left (`fixed bottom-5 left-4 z-50`), providing a 64×64px circular floating action button paired seamlessly with the floating Cart Summary CTA (`left-22 right-4`).

### `size="cta"` (64px) vs `size="lg"` (56px)
- **`size="cta"` (64px)**: Reserved exclusively for the flow-culminating primary action (`CartDrawer`, `CheckoutSheet`, `ProductDetailSheet`, `CartSummaryPill`).
- **`size="lg"` (56px)**: Used for general primary actions (`Settings`, `ConfirmationStep`, `StaffCallButton`).

### Quantity stepper — standardize on 32px
Two different stepper button sizes exist for the identical +/- pattern: **28px** (`ProductDetailSheet.tsx`) and **32px** (`CartDrawer.tsx`). Standardize on **32px** (`h-8 w-8`) — it's a more comfortable repeat-tap target for a control a visitor is likely to tap multiple times in a row (unlike a one-shot close button), and it's already what the higher-frequency-use cart-quantity control uses.

### Toss TDS Tactile Toggle Switch (50×30px)
`components/ui/switch.tsx` is standardized to Toss Design System's tactile toggle:
- Container: `h-[30px] w-[50px] rounded-full`, background `data-checked:bg-primary data-unchecked:bg-[#E5E8EB]`.
- Thumb: `size-[26px] bg-white rounded-full`, smooth spring slide `data-checked:translate-x-[22px] data-unchecked:translate-x-[2px]`.

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
