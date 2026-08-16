# 0010 — Deepen press-feedback scale across the app

**Status:** Accepted

## Context

Asked directly to make interactive elements feel more fluid, specifically calling out button press feedback as too subtle ("버튼 누를때 조금 더 사이즈 조절을 intensive하게" — make the size adjustment on press more intensive). The prior standard (`docs/animation-guide.md` §2, pre-0010) set `whileTap={{ scale: 0.97~0.98 }}` uniformly for every interactive element, content and icon alike — at 44–64px content-control sizes a 2–3% scale change is close to the threshold of being perceptible at all, and the same value on small 28–44px icon buttons (`HeaderBar`, `StaffCallButton`) read as even less noticeable relative to their footprint.

An app-wide grep of every `whileTap` call site (20 across `components/` and `app/`) confirmed the values in actual use already clustered inconsistently in the 0.90–0.98 range with no documented rule for which controls got which value — some icon buttons already sat at 0.94 (a designer's earlier instinct that icon controls need more scale than content controls), but nothing tied that instinct to a documented standard, and most content controls sat at the barely-perceptible 0.97–0.98 end.

## Decision

Adopt two explicit tiers in `docs/animation-guide.md` §2, replacing the single fuzzy range:
- **Content controls** (buttons, cards, list rows, selection options): `scale: 0.96` — deepened from 0.97–0.98.
- **Icon/chip controls** (icon-only buttons, nav chips): `scale: 0.90` — deepened from 0.94–0.96, on the reasoning that small controls can absorb more relative scale change before it reads as excessive deformation, and need the extra intensity to stay perceptible given their smaller footprint.

Applied consistently across every `whileTap` call site app-wide (`components/settings/SettingsRow.tsx`, `components/flow/{StaffCallButton,FeaturedMenuSection,ProductDetailSheet,CheckoutSheet,CartSummaryPill,LandingClientView,ProductCard,MenuCategoryHeader}.tsx`, `components/layout/HeaderBar.tsx`, `app/settings/{page,payment/page}.tsx`), plus the two CSS-only `:active` fallbacks used where a plain `Button`/link isn't wrapped in `motion` (`components/ui/button.tsx`, `app/order/[storeId]/page.tsx`) — both moved from `active:scale-[0.98]` to `active:scale-[0.96]`, matching the content-control tier since neither is an icon-only control. The quantity-stepper `+`/`-` buttons (`ProductDetailSheet.tsx`, `CartDrawer.tsx`) were already at `0.9` and needed no change — they'd already converged on what became the icon/chip standard independently.

Spring physics (`stiffness: 400, damping: 25`) are unchanged — this decision is about scale amplitude specifically, not spring stiffness/timing, which were already well-tuned.

## Consequences

- Press feedback is measurably more tactile across every interactive element, and — for the first time — follows one documented rule instead of ad hoc per-component values chosen without a stated reason.
- Icon buttons and content controls are now deliberately *different* intensities rather than accidentally similar, which better matches how their visual footprints differ.
- Any new interactive component should default to one of these two tiers rather than picking a fresh value — `docs/animation-guide.md` §2 is the citation.

## Alternatives considered

- **Deepen spring stiffness/damping instead of (or alongside) scale.** Rejected — the explicit ask was about scale intensity specifically ("사이즈 조절을... intensive하게"), and the existing `400/25` spring already produces a snappy, non-mushy release; changing it risked solving a problem that wasn't reported.
- **One universal scale value for everything.** Rejected — this was the status quo (with drift), and it under-serves small icon controls exactly as observed above; a footprint-aware two-tier standard is a small addition in complexity for a real perceptual improvement.
