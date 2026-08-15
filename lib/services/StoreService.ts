import type { StoreInfo } from "@/lib/types";

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fictional venues -- no real venue partnerships exist yet (PRODUCT.md's
// Evidence on Hand). Any storeId outside this set is treated as invalid.
const MOCK_STORES: Record<string, string> = {
  "jumun-cafe-01": "주문 카페 1호점",
};

// Returns null (never throws) for an invalid/expired store or table -- this is
// an expected, designed-for outcome (docs/features.md's Entry fallback and
// "Invalid or expired store/table link" failure state), not an exceptional one.
// See docs/architecture.md's deliberate null-vs-throw convention.
export async function resolveStore(storeId: string, table: string): Promise<StoreInfo | null> {
  await delay(MOCK_LATENCY_MS);
  const storeName = MOCK_STORES[storeId];
  if (!storeName || !table) return null;
  return { storeId, storeName, table };
}
