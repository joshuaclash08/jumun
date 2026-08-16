import storeData from "@/lib/data/stores.json";
import type { StoreInfo, StoreListing } from "@/lib/types";

// Source of truth is lib/data/stores.json, not hardcoded TS.
const STORES = storeData.stores as StoreListing[];
const STORES_BY_ID = new Map(STORES.map((store) => [store.storeId, store]));

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resolveStore(storeId: string, table: string): Promise<StoreInfo | null> {
  await delay(MOCK_LATENCY_MS);
  const store = STORES_BY_ID.get(storeId);
  if (!store || !table) return null;
  return { storeId, storeName: store.storeName, table };
}

export function getAvailableStores(): StoreListing[] {
  return STORES;
}
