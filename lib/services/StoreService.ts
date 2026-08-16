import storeData from "@/lib/data/stores.json";
import type { OrderType, StoreInfo, StoreListing } from "@/lib/types";

// Source of truth is lib/data/stores.json, not hardcoded TS.
const STORES = storeData.stores as StoreListing[];
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
