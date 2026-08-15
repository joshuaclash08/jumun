# 0002 — Menu domain: fictional cafe + light food

**Status:** Accepted

## Context

Legacy never settled on what Jumun actually sells, and left two contradictory answers behind:

- `legacy-reference/docs/features.md` specs an "ultra-simple" 2-item menu: 아메리카노 (Americano) and 녹차 (Green tea).
- `legacy-reference/lib/data/burgers.json`, the mock data actually wired into the shipped components, is real McDonald's Korea content: real item names (빅맥 / Big Mac, 1955 버거), real scraped nutrition tables (calories, sugar, protein, fat, sodium, allergens, country of origin), and real image URLs pointing at `mcdonalds.co.kr`.

The second one is a trademark and content-provenance problem independent of any design opinion — shipping a prototype (even a non-commercial one) with a real company's branding, real product names, and hotlinked images from their production CDN is not something to inherit, regardless of how navigation or accessibility questions get resolved.

Separately, the 2-item coffee menu is too thin to meaningfully prototype the parts of the flow that matter most: option groups (size, temperature, milk substitution), a cart with more than one distinguishable line item, and quantity/undo interactions.

## Decision

Jumun's Phase 1 menu is a fictional cafe + light food concept: roughly 8–12 invented items spanning coffee, other beverages, desserts, and light food (toast/sandwich-style items), across 3–4 categories. Every item name, description, price, and image is original or clearly placeholder — nothing scraped, no real brand association.

Items carry real option groups where it makes sense (temperature for coffee, size for beverages, milk substitution) specifically so the cart and customization UI has real complexity to handle, not just a name and a price.

## Consequences

- Zero trademark/IP exposure — nothing here traces back to a real company.
- A cafe/light-QSR domain matches the product's own premise: self-order kiosks in Korea are overwhelmingly a QSR/cafe/fast-casual pattern, not full-service dining, so this domain reinforces the "kiosk replacement" framing rather than working against it.
- Legacy's existing `Product` category union (`lib/types/kiosk.ts`) is close to reusable conceptually (coffee / beverage / dessert / food style categories) — minimal type rework needed once implementation starts, without reusing any of the actual seeded data.
- Option-group complexity (size/temperature/milk) gives the cart, undo, and checkout flows something real to exercise in the Phase 1 prototype.

## Alternatives considered

- **Fictional QSR (burgers/sets/sides).** Structurally similar to what legacy actually built, just with invented branding. Not chosen — no strong reason to keep the burger-combo complexity (sides, sauces, combo upsizing) over a cafe menu for a first prototype, and cafe items map more naturally onto option groups worth testing (temperature, milk) than burger combos do.
- **General restaurant (Korean/Asian dining, categories + dishes).** Not chosen — full-service dining is a weaker fit for the "kiosk replacement" premise than QSR/cafe is, and a broader menu adds content-authoring effort without adding interaction complexity worth prototyping.
