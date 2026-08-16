# 13. Real Photography for Menu/Product Imagery

Date: 2026-08-16
Status: Accepted

## Context

`DESIGN.md` and `docs/component-standards.md` documented flat illustration (`components/ui/TossIllustrations.tsx`) as the only sanctioned imagery for menu/product surfaces, with real food photography explicitly banned ("a fabricated photorealistic food photo would be a worse failure than a confident flat illustration"). ADR 0012 (same day) already flagged the tension: the 2-column card grid format "suffers severe legibility loss when transitioning to real food/drink photos," anticipating this change before it landed.

Independently of that documented rule, `ProductCard.tsx`, `FeaturedMenuSection.tsx`, and `ProductDetailSheet.tsx` were migrated to render real photography via `next/image` + `product.imageUrl`, with `lib/types/menu.ts` gaining an `imageUrl` field and 19 corresponding assets added under `public/images/menu/`. This ADR resolves the resulting doc/implementation conflict by confirming the direction rather than reverting it.

## Decision

Menu/product imagery uses real photography, not flat illustration:
- **In scope**: the menu grid card (`ProductCard.tsx`), the featured/BEST carousel (`FeaturedMenuSection.tsx`), and the product detail hero stage (`ProductDetailSheet.tsx`).
- **Out of scope, stays flat illustration**: empty/celebratory states — empty cart (`CartDrawer.tsx`), staff-call (`StaffCallButton.tsx`) — which have no product photo to show and aren't part of this change.
- The Phase 1 menu remains fictional (`docs/decisions/0002-menu-domain.md`); these are stock/generated photos illustrating a fictional menu, not claims about a real venue's actual food.

## Consequences

- `DESIGN.md`'s "Illustration, not photography" line and the matching Don't-bullet are superseded — updated in this pass to describe the photography rule and its scope.
- `docs/component-standards.md` §1 (imagery/card-geometry table) is now stale against the live component implementation, which was still being actively revised as of this ADR; it needs a follow-up pass once that work settles rather than being re-documented mid-flight.
- Every other Border-and-Shadow / One-Accent / status-legibility rule in `DESIGN.md` is unaffected — this ADR is scoped to the illustration-vs-photography question only.
