import type { CartItem } from "@/lib/types";

/**
 * Formats a numeric amount as a Korean Won price string, e.g. 12000 -> "12,000원".
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** Sums a cart's line items into a total item count and total price. */
export function getCartTotals(items: CartItem[]): { totalQuantity: number; totalPrice: number } {
  return items.reduce(
    (totals, item) => ({
      totalQuantity: totals.totalQuantity + item.quantity,
      totalPrice: totals.totalPrice + item.unitPrice * item.quantity,
    }),
    { totalQuantity: 0, totalPrice: 0 }
  );
}

/**
 * A cart line's display name. `nameKo` is an optional client-side
 * convenience field, so every call site needs a fallback -- `fallback`
 * defaults to the item's own productId, but callers needing a friendlier
 * generic fallback (e.g. an a11y label) can pass one explicitly.
 */
export function getCartItemDisplayName(item: CartItem, fallback: string = item.productId): string {
  return item.nameKo || fallback;
}
