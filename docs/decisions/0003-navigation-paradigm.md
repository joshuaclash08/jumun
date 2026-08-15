# 0003 — Navigation paradigm: single-focus wizard + fixed bottom bar

**Status:** Accepted

## Context

Legacy's actually-shipped code (`legacy-reference/components/kiosk/MenuCatalogStep.tsx`) uses a persistent bottom sliding dock with AI / Cart(장바구니) / Settings tabs, always visible during ordering. That same component also implements a live inactivity countdown:

```tsx
const limitSeconds = timeoutExtensionEnabled ? 180 : 60;
// ...warningCountdown state, wired to a visible warning UI
```

This directly contradicts this project's design spec (`docs/design-system.md`), which explicitly rules out countdown timers and time-pressure UI anywhere. The countdown lives inside the same component as the tab dock, not as an independent feature — inheriting the dock's structure risks inheriting the timing logic along with it.

The design spec's actual instruction on navigation is narrower than a persistent tab dock: it asks for core action buttons (담기 / 다음 / 결제하기) placed in a fixed bottom sheet/bar for thumb-zone, one-handed reachability. It does not describe persistent multi-tab chrome.

Separately, this project confirmed its own usage model directly: Jumun is not a shared kiosk terminal that a queue of different people walk up to and operate in turn. It's BYOD — one person, their own phone, their own individually-paced session, arrived at via their own QR/NFC scan. A public walk-up terminal benefits from always-visible navigation chrome because sessions are interrupted and re-entered by different people; a personal, single-session phone flow doesn't have that requirement.

## Decision

Jumun uses a single-focus wizard: one primary task per screen, with one or two primary action buttons pinned to a fixed bottom bar (52–64px tall, per `docs/design-system.md`'s touch-target scale). A small back affordance appears top-left on any screen after the first. Cart is not a permanent tab — it opens as a bottom sheet triggered from a small status pill, showing item count/total, that's visible but non-blocking during menu browsing. A small settings-icon affordance is present throughout (see `docs/decisions/0001-onboarding-model.md`), but is a single icon, not a tab bar.

No countdown timers or inactivity warnings are implemented anywhere in this flow.

## Consequences

- Matches the design spec's literal instruction (bottom bar for core actions) rather than legacy's heavier, unrequested tab-dock pattern.
- Sidesteps inheriting the countdown-timer bug structurally, by not adopting the component it lived inside.
- Fits the confirmed BYOD/personal-session usage model better than persistent walk-up-terminal-style chrome would.
- Slightly less "everything visible at once" than a tab dock — mitigated by the cart status pill staying visible during browsing, so cart state is never hidden, just not a full permanent tab.

## Alternatives considered

- **Persistent bottom tab dock**, redesigned to drop the countdown-timer bug but keep the always-visible tab structure. Not chosen — the product's own usage model (individually-paced, single-session, BYOD) doesn't need walk-up-terminal navigation conventions, and the design spec doesn't ask for tab chrome. Worth reconsidering only if user testing shows people lose track of where they are in a pure wizard flow.
