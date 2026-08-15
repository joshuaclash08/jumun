# Jumun — Master Plan

## What is Jumun

Jumun (주문, "order") is a barrier-free self-order platform. A person scans a QR/NFC code at their table with **their own phone** and independently browses a menu, places an order, and pays — entirely from their personal device. There is no shared or mounted kiosk hardware anywhere in this product: every session is bring-your-own-device (BYOD), one person, one phone.

It exists to replace physical self-order kiosks, which are frequently unusable for blind and low-vision users, hearing-impaired users, people with mobility or motor impairments, and elderly users — a well-documented accessibility gap in unattended self-service terminals. Rather than retrofitting accessibility onto a kiosk, Jumun starts from a phone (a device most people already carry, already configured with their own accessibility settings — screen reader, text size, etc.) and layers a genuinely accessible ordering flow on top.

The product design principle is not "a special mode for disabled users." It's a single, well-designed, modern ordering experience — with real animation and polish — that happens to meet a strict accessibility baseline (WCAG 2.2 AA contrast, 44px+ touch targets, visible focus rings, no time-pressure UI) for every single user, by default. See [docs/decisions/0001-onboarding-model.md](docs/decisions/0001-onboarding-model.md) for the full reasoning behind that choice.

The physical entry point is a single tag at the table carrying both a printed QR code and an NFC chip behind it — scanning or tapping either leads to the same instant, no-install page, which automatically restores the user's previously saved accessibility settings and sets the current store/table context. See [PRODUCT.md](PRODUCT.md) for the full product record this plan is grounded in.

**Beyond food.** Food ordering is Jumun's first proof of concept, not its ceiling. The underlying pattern — a physical QR/NFC tag that instantly opens an accessible, no-install, no-gate transaction flow with settings that follow the user everywhere — is meant to generalize to other service verticals over time (flight tickets and cinema were both raised as examples, not commitments). Phase 1 stays concretely food-scoped; see Product Principles in `PRODUCT.md` for how this shapes decisions without expanding current scope.

## Current status

**Phase 1, foundation complete.** The documentation set is in place (see "How this documentation set works" below), and the project foundation is built: dependencies installed, shadcn initialized (`--base radix`), the folder structure from `docs/architecture.md` in place with real types/data/services/stores/hooks, and the app shell (fonts, design tokens, viewport, routing) wired and verified in a browser. No real ordering screens (menu browsing, cart, checkout) or their business logic are built yet — that's the next round. See "Phase 1 scope" below for exactly what's in and out at this stage.

A `legacy-reference/` folder exists alongside this plan (not tracked in this repo's git history — see `.gitignore`) containing a prior, partially-built attempt at this same product. It's used strictly as a source of ideas, constraints, and cautionary examples — not as a spec to inherit. Every place this documentation set draws on it, it says so explicitly, including where legacy got things wrong (a dead-end button, a countdown timer, disabled pinch-zoom, trademarked mock data — see the decision records in `docs/decisions/` for specifics).

## Phased roadmap

This phasing is carried forward from legacy's own planning, because it fits Jumun's actual constraints well: a phone-first accessibility product needs to prove itself as a web experience before it's worth the overhead of native app development.

### Phase 1 — Web Prototype (current phase)

A Next.js web app, mobile-viewport-only, deployed somewhere a QR/NFC tag can point to. No app install required — the whole point is that scanning the code works instantly. This is the only phase currently in scope for active work. See `docs/features.md` for the screen-by-screen flow and `docs/tech-stack.md` for the full stack.

### Phase 2 — Native Port (Expo / React Native)

Web-standard APIs hit real limits for this product: iOS Safari has no Vibration API at all (haptics on iOS web are simply not possible, not even via polyfill), background NFC scanning isn't available to web pages, and precise device sensor access is inconsistent across browsers. Phase 2 ports the Phase 1 app to an Expo/React Native monorepo (with `react-native-web` so the web version keeps working from the same codebase) specifically to unlock these native APIs. This is why `docs/architecture.md` specifies wrapping all hardware-adjacent logic (haptics, motion/reduced-motion detection) behind small hook interfaces now — Phase 2 should only need to swap the implementation inside each hook, not rewrite every call site.

### Phase 3 — App Store Publication + iOS App Clip

Once there's a real native app, add an iOS App Clip target. App Clips can't be distributed standalone — they require a published parent app to attach to, which is why this phase strictly follows Phase 2, not before. App Clip Experience registration requires Apple review lead time; budget for that separately from ordinary App Store review when this phase starts.

### Phase 4 — Universal Links / App Links

Wire up iOS Universal Links (`apple-app-site-association`) and Android App Links (`assetlinks.json`) so a QR/NFC scan auto-routes: users who've installed the native app deep-link straight into it, users who haven't land on the App Clip (iOS) or the web experience (Android / no App Clip support).

**Important, confirmed distinction:** this is not the point where the web version becomes a legacy fallback. The native app is a companion surface, not a replacement — someone who deliberately prefers not to install anything keeps a fully-supported web experience indefinitely, not just until they're nudged to install. Auto-routing logic should route *un-installed* users toward native, not treat everyone on web as someone who simply hasn't upgraded yet.

## Phase 1 scope

### In scope

- Menu browsing, cart, mocked checkout, order confirmation — the full ordering flow, grounded in a fictional cafe menu (see `docs/decisions/0002-menu-domain.md`)
- The full accessibility baseline from `docs/design-system.md` applied to every screen by default — not an opt-in mode
- A reachable-anytime settings panel for further personalization (high-contrast/AAA, font scale, reduced motion, haptics, dyslexia spacing, language)
- Native screen reader support (VoiceOver / TalkBack) via correct semantic HTML and ARIA — this is in scope everywhere, at all times, because it's a matter of writing correct markup, not a separate feature to build
- Mobile viewport only (roughly 360–430px wide); zero effort spent on tablet or desktop layouts

### Explicitly out of scope for Phase 1

- **Voice ordering (STT) and auto-TTS screen narration.** Legacy treated these as headline features; this plan defers them to Phase 2+. See `docs/decisions/0004-voice-scope.md` for the full reasoning.
- **Real payment processing.** Checkout is mocked in Phase 1 — no PG/Stripe integration, no real money movement.
- **Real backend / persistence.** Menu and order data are static/mocked. A real API is a Phase 2+ concern.
- **Any native hardware API** (precise haptics beyond `navigator.vibrate` on Android Chrome, background NFC, native sensors) — these wait for Phase 2 by design; see the roadmap above.
- **Desktop/tablet layouts.** This is a phone-only product experience for the foreseeable future.

## How this documentation set works

| File / folder | Purpose |
|---|---|
| `README.md` | Entry point — one-line pitch, current status, links to everything below |
| `plan.md` (this file) | The roadmap and current-phase scope boundary — the "why" and "when" |
| `PRODUCT.md` | The confirmed product record — users, purpose, positioning, operating context, constraints. Written via the impeccable skill's `init` flow; update it when product truth changes, not when the design changes |
| `DESIGN.md` | The established visual world for the web surface — the "how it should feel," grounding every UI decision so it doesn't drift toward generic defaults |
| `docs/tech-stack.md` | Every library in use, why, and how responsibilities are divided between similar tools |
| `docs/architecture.md` | Folder structure, patterns (service layer, hook wrappers), data model, service contracts, state shape, viewport policy |
| `docs/design-system.md` | Design tokens and component-level visual/interaction patterns — colors, type, spacing, motion, elevation, screen-reader content authoring |
| `docs/features.md` | The screen-by-screen user flow for the Phase 1 MVP, including states and motion choreography |
| `docs/testing-strategy.md` | Unit/component/accessibility testing approach |
| `docs/decisions/*.md` | Short ADRs — one per real architectural fork, capturing context and reasoning permanently, so it survives edits to the docs above |
| `CHANGELOG.md` | Append-only history — one entry per commit, in Keep a Changelog format |

The topic docs (`tech-stack.md`, `architecture.md`, `design-system.md`, `features.md`) describe **current state** and get edited in place as the project evolves. `CHANGELOG.md` is the **history** — it never gets rewritten, only appended to.

## Working agreement

From this point forward, every change to this project — application code, a feature added or removed, a design token adjusted, anything, no matter how small — gets written up in markdown (updating the relevant doc in place, plus a `CHANGELOG.md` entry) **and** committed to git, in the same commit. No undocumented, uncommitted changes. This applies to every future working session on Jumun, not just this initial planning round.
