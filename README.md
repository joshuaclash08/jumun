# Jumun (주문)

A barrier-free self-order platform. Scan a QR/NFC code at your table with your own phone, and order and pay independently — no app install, no shared kiosk hardware, and accessible (WCAG 2.2 AA contrast, 44px+ touch targets, visible focus rings, no time-pressure UI) by default for every user, not as an opt-in mode.

## Status

**Phase 1, documentation stage.** This repository currently contains planning documents only — no application code, no dependencies installed yet. See [plan.md](plan.md) for the full roadmap and exactly what "documentation stage" means.

## Documentation

| Doc | What's in it |
|---|---|
| [plan.md](plan.md) | Roadmap (Phase 1–4), current-phase scope boundary, and the working agreement governing all future changes |
| [docs/tech-stack.md](docs/tech-stack.md) | Every library in use, why, and how overlapping tools divide responsibility |
| [docs/architecture.md](docs/architecture.md) | Folder structure, core patterns, state shape, viewport policy |
| [docs/design-system.md](docs/design-system.md) | The accessibility spec as concrete design tokens — color, type, spacing, focus, motion |
| [docs/features.md](docs/features.md) | Screen-by-screen flow for the Phase 1 MVP |
| [docs/decisions/](docs/decisions/) | ADRs — one per real architectural fork, with context and reasoning |
| [CHANGELOG.md](CHANGELOG.md) | Append-only history, one entry per commit |

A `legacy-reference/` folder exists locally alongside this project (not tracked in this repo's git history) containing a prior, partially-built attempt at this product. It's referenced throughout the docs above where relevant — both for useful patterns worth keeping and for specific, verified problems this project's plan deliberately does not repeat.

## Working agreement

Every change to this project — code, a feature added or removed, a design token adjusted, anything — is written up in markdown (the relevant doc updated in place, plus a `CHANGELOG.md` entry) and committed to git, in the same commit. See [plan.md](plan.md#working-agreement).
