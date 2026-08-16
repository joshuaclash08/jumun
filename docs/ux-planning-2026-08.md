# UX Planning Notes — August 2026

**Scope note: this started as a planning document; several items below were subsequently applied on direct follow-up instruction ("적용까지 된거야?").** Each item is marked **Applied**, **Already fixed** (was part of concurrent work), or **Open** (still a real recommendation, not yet done). Cross-references `docs/component-standards.md` for the prescriptive target state each finding points toward.

**⚠️ New finding, most significant item in this document — see §7.** While reconciling this doc against the live app, a systemic violation of the product's own stated "never render text smaller than 16px, anywhere" floor was found: `text-xs` (12px) is used at ~29 call sites app-wide for descriptions, badges, timestamps, and captions. This wasn't part of the original audit and needs a decision before it's touched — see §7 for the full list and the tradeoff.

---

## 1. Page-by-page

### `/` (Landing)
- Hero NFC/QR animation, store picker, camera-scan CTA — no structural issues found. Explicitly out of scope for any animation changes this round (protected per direct instruction).
- The store-picker link rows and main CTA share the app's standard press feedback (now `0.96`, `docs/decisions/0010`) — no landing-specific issue.

### `/order/[storeId]` (Menu)
- **Already fixed**: the menu ↔ order-confirmation swap was a hard conditional return with no transition; now wrapped in `AnimatePresence` using the already-documented-but-previously-unwired `docs/animation-guide.md` §3A recipe.
- **Menu list row geometry is tight.** At a 375px-wide phone with the page's `px-4` content padding, a `ProductCard` row's available width after the 56px icon tile, gaps, and price column leaves roughly 155–170px for the actual product name — workable for the current short Korean menu names, but a longer name plus the `품절` (sold-out) badge on the same line will wrap to a second row and inflate past the row's `min-h-[76px]`, not truncate. **Recommendation**: either commit to truncation (`line-clamp-1` + full name in the accessible label, which already carries the complete sentence) so row height stays predictable, or accept variable row height as intentional — right now it's neither decided nor tested against a long real menu name.
- **Icon tile / future photo readability** — see `docs/component-standards.md` §1 for the full analysis. Short version: 56px list-row tiles are too small for real product photos without a layout change; 64px (detail sheet) and 96px (carousel) are workable today.

### `/settings`, `/settings/accessibility`, `/settings/payment`
- **Applied**: all three pages' fixed-bottom CTA switched from `size="cta"` + a `h-14`/`rounded-[16px]` override back to `size="lg"` directly (its native spec matches exactly what was being overridden to) — `app/settings/page.tsx`, `app/settings/payment/page.tsx`, `app/settings/accessibility/page.tsx`, and `components/flow/ConfirmationStep.tsx` (same pattern, same fix).
- **Applied**: `app/settings/payment/page.tsx`'s payment-method cards now render via `SettingsCard` (`components/settings/SettingsRow.tsx`) instead of ~90% hand-duplicated markup. `SettingsCard` gained a new `ariaPressed` prop in the process — the original bespoke markup had `aria-pressed={isSelected}` for correct toggle semantics, which the shared component didn't previously expose; added rather than silently dropped.
- Font-scale and language pickers use a 3-across / 2-across button grid with selected/unselected `Button` variants — consistent pattern between the two, no issue found there.

---

## 2. Popups / overlays

Full inventory in `docs/component-standards.md` §4. Findings:

- **Applied**: close ("X") button size drift (44px in `CartDrawer`/`StaffCallButton`, 40px in `CheckoutSheet`, 36px in `ProductDetailSheet`) unified to 44px everywhere — dropped the `h-10 w-10`/`h-9 w-9` overrides in `CheckoutSheet.tsx` and `ProductDetailSheet.tsx`.
- **Applied**: quantity stepper size drift (28px in `ProductDetailSheet` vs. 32px in `CartDrawer`) unified to 32px — `ProductDetailSheet.tsx`'s stepper buttons and count-label width now match `CartDrawer.tsx` exactly.
- **`components/ui/sheet.tsx` and `components/ui/dialog.tsx` are unused dead code** — every actual sheet in the app renders `Drawer`, despite two components being *named* `...Sheet`. Two decisions to make, not made here:
  1. Remove `sheet.tsx`/`dialog.tsx` as dead weight, since `Drawer` has fully absorbed their role, or
  2. Keep `dialog.tsx` specifically as the foundation for a genuine centered-modal pattern this app currently lacks entirely — **there is no destructive-confirmation dialog anywhere in the product**, including cart-item removal, which fires immediately with only a toast+undo. If product direction ever wants a harder confirm step before a destructive action (rather than the current fire-then-undo model), `dialog.tsx` is already there, unused, ready to be the foundation — removing it now would mean re-adding it later.
  - **No recommendation forced here** — this is a real product-direction question (is fire-then-undo sufficient forever, or will some future destructive action want a harder confirm?), not a code-quality cleanup call.

---

## 3. Notifications / toasts

- Single-toast-only model (`A11yToastContainer.tsx` only ever shows the newest toast) is a deliberate, reasonable simplicity choice given this product's actual toast volume — documented as the standard in `docs/component-standards.md` §5, not flagged as an issue.
- No current collision with the bottom cart pill (opposite viewport edges) — flagged only as a future watch-item if toast content or the pill's footprint ever grows.
- `LiveRegionAnnouncer.tsx` (sr-only, separate from the visible toast) — confirmed present and distinct, no issue found.

---

## 4. Settings / system / logic

- **Applied**: the `cta` vs `lg` prop-choice standard is now enforced at every call site found (§1) — `cta` reserved for the single genuinely 64px flow-culminating action (payment, add-to-cart, cart checkout), `lg` for "this screen's main button" everywhere else.
- **Radius authoring**: superseded by a bigger finding — see `docs/decisions/0011-graduated-radius-scale.md`. The actual shipped radius scale is a 7-step graduated system, not the flat 5-value scale this document and `DESIGN.md`/`docs/design-system.md` originally described; those three docs are now corrected. The literal-`rounded-[Npx]`-vs-CSS-var authoring point still stands as written in `docs/component-standards.md` §6.
- **Border-opacity values used ad hoc** (`border-border`, `/40`, `/60`, `/80` with no documented rule until now) — see `docs/component-standards.md` §7 for the resolved standard and the one call site (`/80`) recommended for retirement. Still open.
- **Verified, not a bug**: `w-38` (`FeaturedMenuSection.tsx`) and `h-13` (`LandingClientView.tsx`) both resolve correctly — computed styles confirm 152px and 52px respectively. Tailwind v4's dynamic spacing scale generates these on demand; they were never a risk. Closed.

## 5. New finding: `text-xs` (12px) used at ~29 call sites, below the product's own stated 16px floor

`docs/design-system.md`'s own spec states, unconditionally: *"Small/meta: 16px — Floor — never go smaller anywhere in this product."* `DESIGN.md` repeats this as a Do: *"never render any text smaller than 16px, anywhere — including where Toss's own scale would go smaller."* Both trace back to `PRODUCT.md`'s core identity (accessible-by-default for low-vision/elderly users, not an opt-in mode).

Grepping the live codebase: `text-xs` (Tailwind default = 12px, unconfirmed by any theme override — checked, none exists) appears at **29 call sites** across `app/settings/*`, `components/settings/SettingsHeader.tsx`, `components/layout/HeaderBar.tsx`, `components/ui/badge.tsx`, `components/ui/button.tsx` (the `xs` size's own label), and nearly every `components/flow/*` file — consistently for descriptions/sublabels, badges ("매장 식사", "필수"), timestamps, meta counts ("3개 메뉴"), and helper captions ("추가금 없음"). Two of these (`app/settings/page.tsx`, `components/settings/SettingsRow.tsx`) use a responsive `text-xs sm:text-sm` pattern — meaning on the actual target viewport (phones, <640px) they're still 12px; the `sm:` upgrade only helps a desktop browser tab, which this product treats as secondary.

**This was not part of the original audit** — it surfaced while reconciling this document against the live app in response to being asked directly whether every standard had actually been checked. None of the other findings in this document come close to this in stakes: this is a literal, stated, repeated non-negotiable floor, and it's currently violated at scale, not at one or two edge cases.

**The tradeoff, stated plainly, not pre-decided:**
- **Fix it**: bump all 29 sites to `text-base` (16px) minimum. This is the floor as literally documented — but 16px for a badge like "필수" or a timestamp is a real, sizeable visual change (badges/captions would no longer read as visually "quieter" than body text), touches ~15 files, and needs a real visual pass afterward (line-wrapping, badge padding, row-height knock-on effects), not just a find-and-replace.
- **Narrow the floor's scope instead**: the original floor language ("never render any text smaller than 16px, anywhere") is more absolute than the product's actual accessibility spec strictly requires — WCAG doesn't set a minimum font-size in px, only contrast and (separately) resizability; the 16px floor was this project's own chosen interpretation, applied without exception. A narrower, still-defensible version — 16px+ for anything a user needs to *read to complete the task* (names, prices, primary content, form labels), with a lower documented floor (e.g. 13–14px) for genuinely decorative/glanceable meta text (badges, timestamps) — would validate most of the current 29 sites as intentional rather than broken, at the cost of walking back an absolute rule stated three times in the docs.

**Resolved**: fixed all 29 sites to `text-base` (16px), including dimension adjustments to `badge.tsx` and `button.tsx`'s `xs` size to fit the larger text. See `CHANGELOG.md`.

**New, larger finding surfaced while fixing this**: `text-sm` (14px) — also below the 16px floor — is used at **36 more call sites across 20 files**, including `components/ui/button.tsx`'s `default` size (the most-used button size app-wide, per its own code comment "used for most interactive controls") and `sm` size. This has a materially bigger blast radius than the `text-xs` fix: changing `button.tsx`'s `default` text size affects every default-size button in the app, not just 36 explicit spans — an invisible multiplier a plain grep count doesn't capture. Flagged back to the user rather than silently folded into the same pass; not yet decided or applied.

---

## 6. Animation (implemented this round, noted here for completeness)

These were direct-action requests, not planning-only, and are already done — listed here only so this document is a complete picture of the session's UX work:
- GSAP removed; confirmation-step reveal reimplemented with Motion `variants`/`staggerChildren`, success icon given a distinct celebratory spring-pop (`docs/decisions/0009-motion-only-animation.md`).
- Press-feedback scale deepened app-wide, two-tier standard (content vs. icon controls) documented (`docs/decisions/0010-deeper-press-feedback.md`).
- Menu ↔ confirmation screen transition wired up (§1 above).

**Not implemented, queued as a recommendation**: a "selection pulse" micro-animation for `ProductDetailSheet`/`CheckoutSheet`'s `SelectionCard`/option rows — currently selection feedback is the standard tap-spring plus a CSS color/border transition on the selected state, which is solid but not distinctly "celebratory" the way the confirmation screen now is. A small `scale` keyframe pulse (e.g. `1 → 1.03 → 1` over ~200ms) triggered on the moment a selection *changes* (not on every tap, only on the state flip) would give selecting an option a slightly more satisfying, content-appropriate beat without touching the underlying spring/press-feedback standard. Left as a recommendation rather than implemented this round to keep this pass's actual animation-library changes (GSAP removal, press-scale, page transition) reviewable as a bounded set.

---

## 7. Priority read (what's left)

Everything mechanical is now applied. What's actually still open, highest-stakes first:

1. **`text-xs` 16px-floor decision (§5)** — by far the highest-stakes open item. Needs an explicit call: fix all 29 sites to 16px, or deliberately narrow the documented floor's scope. Not a "just do it" item — see §5 for the full tradeoff.
2. Border-opacity cleanup (§4) — low-stakes, cosmetic, the one remaining mechanical item from the original audit.
3. Menu-card icon-to-photo decision (§1 page section, full analysis in `docs/component-standards.md` §1) — no urgency until real product photography exists, but worth deciding the target pattern before that day arrives.
4. `sheet.tsx`/`dialog.tsx` dead-code-or-reserve decision (§2) — lowest urgency, genuinely a product-direction question more than a cleanup task.
5. "Selection pulse" micro-animation recommendation (§6) — a nice-to-have, not a gap.
