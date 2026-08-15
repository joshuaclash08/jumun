// vitest-axe@0.1.0 ships its type augmentation against Vitest's older global
// `Vi` namespace (see its own dist/extend-expect.d.ts), which no longer
// connects to Vitest 4's Assertion type -- Vitest 4 augments the 'vitest'
// module directly instead, the same pattern @testing-library/jest-dom/vitest
// already uses correctly. Runtime behavior is unaffected (expect.extend in
// vitest.setup.ts works either way); this only restores the TypeScript types.
import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

/* eslint-disable @typescript-eslint/no-empty-object-type -- declaration
   merging requires an empty extending interface; this is the standard
   shape for augmenting Vitest's matcher types (see how
   @testing-library/jest-dom/types/vitest.d.ts does the same thing). */
declare module "vitest" {
  // T is required (unused) to match Vitest's own Assertion<T> shape below.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
