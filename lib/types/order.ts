import type { CartItem } from "./cart";

export interface StoreInfo {
  storeId: string;
  storeName: string;
  table: string;
}

export type OrderType = "dine-in" | "takeout";
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
