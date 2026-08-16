# 0011 — Keep the graduated radius scale; correct ADR 0008's docs to match

**Status:** Accepted

## Context

ADR 0008 (`docs/decisions/0008-toss-visual-realignment.md`) adopted Toss's literal component anti-pattern for buttons: a flat 12px radius at every size, justified by the merged Toss skill reference's own stated rule ("Toss doesn't scale radius with button size... 12–14px is a fixed signature band"). `DESIGN.md`, `docs/design-system.md`, and `docs/component-standards.md` were all written to describe that flat scale.

A later, more comprehensive redesign pass — covering `app/globals.css`'s token layer, `components/ui/{button,card,badge}.tsx`, and the bulk of `components/flow/*` and `app/settings/*` — replaced that flat scale with a **graduated "squircle" system** without a corresponding doc update: `app/globals.css` now defines a 7-step token scale (`--radius-xs` 6px → `--radius-2xl` 32px), buttons graduate 10→18px by size, and cards/sheets/icon-tiles hand-tune to literals across that range (16, 18, 20, 22, 24, 26px) rather than snapping to one flat value. This was caught live, verified against the actual shipped `app/globals.css` and component source, while responding to a direct question ("did every standard actually get applied") — the documentation had quietly drifted from the code it was supposed to describe.

Two systems, both internally coherent, now conflict on paper: ADR 0008's flat-12px (literal Toss fidelity) vs. the shipped graduated scale (a considered evolution past literal Toss fidelity toward a more refined, size-proportional "squircle" language, applied consistently across dozens of components and confirmed working correctly live).

## Decision

**Keep the graduated scale as the real, documented standard.** Update `DESIGN.md`, `docs/design-system.md`, and `docs/component-standards.md` to describe it accurately (done alongside this ADR) rather than reverting working, comprehensively-applied, already-verified code to match the earlier, flatter ADR 0008 description.

Reasoning: the graduated scale is not a regression or an accident — it's a cohesive system (larger/higher-emphasis surfaces get proportionally larger radii) applied consistently across the entire redesigned surface, not a one-off deviation in a single component. Reverting dozens of components to force-fit a flatter scale would be pure churn against work that already ships correctly, purely to keep an ADR's letter rather than its spirit — Toss's own anti-pattern this deviates from ("don't scale radius with size") is itself a Figma-component-level rule, not a stated hard constraint on Jumun's own product identity the way, say, the 4.5:1 contrast floor is.

## Consequences

- `DESIGN.md`'s `rounded:` frontmatter, Shapes section, and Button/Card/Bottom-Sheet component specs now describe the real 7-step scale and the button-specific 10–18px graduation.
- `docs/design-system.md`'s Corner radius and Elevation tables now match `app/globals.css` exactly — including the shadow values, which also evolved (softer, more spread `rgba` magnitudes) in the same later pass and had not been re-verified either.
- `docs/component-standards.md` §2 and §6 updated: button radius is graduated, not flat; the radius-authoring convention now explicitly allows hand-tuned intermediate literals near an anchor token rather than requiring exact-token matches.
- **Process note for future passes**: when a design-system ADR is written, re-verify its claims against the actual shipped CSS/components before trusting them in a later session — this is the second time in this project's history a documented token table silently drifted from `app/globals.css` (the first: `docs/design-system.md`'s elevation rgba base color, corrected once already before this ADR, then found to need a second correction here). A stale doc that reads as authoritative is worse than no doc; when in doubt, `grep` the live file.

## Alternatives considered

- **Revert the shipped graduated scale back to ADR 0008's flat 12px, to keep documentation and history simpler.** Rejected — this would mean deliberately regressing a comprehensively-applied, visually-verified, working design system purely to avoid writing a correction. The cost of updating three markdown files is far lower than the cost of re-touching every button/card/sheet component a second time for no user-facing benefit.
- **Leave the docs as-is and treat the drift as a known, undocumented gap.** Rejected — directly contradicts the standing project practice of documenting every change, and was the specific thing asked about ("did you go through all standards") that surfaced this gap in the first place.
