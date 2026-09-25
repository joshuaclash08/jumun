import storeData from "@/lib/data/stores.json";
import type { OrderType, StoreInfo, StoreListing } from "@/lib/types";

// Runtime shape check for stores.json, which architecture.md notes is hand-
// edited during content updates -- a typo'd or missing field here would
// otherwise type-check fine (via the `as` cast) and only surface as an
// `undefined` reaching a component deep in the render tree. Fails loudly at
// module load instead.
function validateStores(raw: unknown): StoreListing[] {
  if (!Array.isArray(raw)) {
    throw new Error("stores.json: `stores` must be an array");
  }
  const requiredStringFields: (keyof StoreListing)[] = [
    "storeId",
    "storeName",
    "branchKo",
    "addressKo",
    "distanceKo",
  ];
  raw.forEach((entry: Partial<StoreListing>, index) => {
    for (const field of requiredStringFields) {
      if (typeof entry?.[field] !== "string") {
        throw new Error(`stores.json: stores[${index}].${field} must be a string`);
      }
    }
    if (typeof entry?.tableCount !== "number") {
      throw new Error(`stores.json: stores[${index}].tableCount must be a number`);
    }
  });
  return raw as StoreListing[];
}

// Source of truth is lib/data/stores.json, not hardcoded TS.
const STORES = validateStores(storeData.stores);
const STORES_BY_ID = new Map(STORES.map((store) => [store.storeId, store]));

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Dine-in requires a table (returns null without one); takeout never has a
// table concept, so `table` is only meaningful for orderType "dine-in".
export async function resolveStore(
  storeId: string,
  orderType: OrderType,
  table?: string,
): Promise<StoreInfo | null> {
  await delay(MOCK_LATENCY_MS);
  const store = STORES_BY_ID.get(storeId);
  if (!store) return null;

  if (orderType === "dine-in") {
    if (!table) return null;
    return { storeId, storeName: store.storeName, orderType: "dine-in", table };
  }
  return { storeId, storeName: store.storeName, orderType: "takeout" };
}

export function getAvailableStores(): StoreListing[] {
  return STORES;
}

// Existence lookup for the entry-flow screens (order-type select, table
// select) that need to confirm a storeId is real before a table is known.
export function getStoreListing(storeId: string): StoreListing | null {
  return STORES_BY_ID.get(storeId) ?? null;
}
