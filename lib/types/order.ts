import type { CartItem } from "./cart";

export type OrderType = "dine-in" | "takeout";

// Discriminated on orderType: a dine-in order always has a table, a takeout
// order never does -- modeling this as one optional field instead let a
// takeout order carry a stale/meaningless table value with no type error.
export type StoreInfo =
  | { storeId: string; storeName: string; orderType: "dine-in"; table: string }
  | { storeId: string; storeName: string; orderType: "takeout" };

export type OrderStatus = "idle" | "submitting" | "failed" | "confirmed";

export interface OrderReceipt {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  orderType: OrderType;
  store: StoreInfo;
  placedAt: string;
}
