# ADR 0006: BYOD (Bring Your Own Device) Architecture

## Context
Physical kiosks are inherently inaccessible for many users due to physical barriers (height, wheelchair access), sensory barriers (lack of audio feedback or tactile interfaces for visually impaired users), and cognitive load (time pressure, complex navigation). The legacy solution attempted to solve some of these, but still required interacting with shared hardware.

## Decision
We are adopting a strict **BYOD (Bring Your Own Device)** architecture for the Jumun platform. Instead of building software for a physical shared kiosk, the entire ordering experience will be served directly to the customer's personal smartphone via a table-mounted QR code or NFC tag.

## Consequences
- **Positive:** Complete elimination of physical barrier issues. Users interact with the device they already own, which is already configured with their preferred accessibility settings (screen reader, font size, contrast, motion preferences).
- **Positive:** Zero hardware maintenance cost for restaurants. No need to sanitize screens or repair broken touch panels.
- **Positive:** No app download required (web-first). The barrier to entry is minimal.
- **Negative/Risk:** Reliance on the user's mobile network or restaurant Wi-Fi.
- **Design Impact:** The UI/UX must be strictly mobile-first, adhering to touch-target standards (44px minimum, 56-64px for primary actions) and accommodating various mobile viewport sizes (safe areas, dynamic keyboards).

## Implementation Notes
- The entry point will resolve a `storeId` and `tableId` from the scanned QR URL.
- We will leverage the Toss-inspired design system to ensure the mobile web app feels as native, fluid, and responsive as a highly polished iOS/Android app.
