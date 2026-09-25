/**
 * Single source of truth for the `/order/[storeId]` route family and its
 * query-string shapes (`?table=`, `?type=takeout`). Every call site that
 * needs one of these URLs should build it here rather than hand-assembling
 * a template literal, so a future change to the scheme (e.g. renaming
 * `table` -> `tableId`, or restructuring the nested route) only needs to
 * touch this file instead of being grepped for across the app.
 */

/** The order-type/menu entry route for a store, e.g. `/order/cafe-01`. */
export function orderPath(storeId: string): string {
  return `/order/${storeId}`;
}

/**
 * Without `table`, the dedicated table-selection screen, e.g.
 * `/order/cafe-01/table`. With `table`, the resolved dine-in order route
 * for that table, e.g. `/order/cafe-01?table=3`.
 */
export function tablePath(storeId: string, table?: string): string {
  return table === undefined
    ? `${orderPath(storeId)}/table`
    : `${orderPath(storeId)}?table=${table}`;
}

/** The resolved takeout order route for a store, e.g. `/order/cafe-01?type=takeout`. */
export function takeoutPath(storeId: string): string {
  return `${orderPath(storeId)}?type=takeout`;
}
