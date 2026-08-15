import type { CartItem, OrderReceipt, OrderType, StoreInfo } from "@/lib/types";

const MOCK_LATENCY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateOrderNumber(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

export interface SubmitOrderOptions {
  // Lets tests and the checkout screen's own retry/demo path deterministically
  // exercise the failure branch, rather than relying on the random default --
  // see docs/testing-strategy.md's requirement that the failure path be
  // provably reachable, not just present in the UI copy.
  forceFailure?: boolean;
}

const MOCK_FAILURE_RATE = 0.1;

// No real backend in Phase 1 (docs/architecture.md) -- mocked latency and a
// reachable simulated failure path, deliberately, per docs/features.md's
// "Order submission fails" state. Cart state is never cleared here; the caller
// (checkout flow) owns clearing it only after a confirmed success.
export async function submitOrder(
  storeInfo: StoreInfo,
  items: CartItem[],
  orderType: OrderType,
  options: SubmitOrderOptions = {},
): Promise<OrderReceipt> {
  await delay(MOCK_LATENCY_MS);

  const shouldFail = options.forceFailure ?? Math.random() < MOCK_FAILURE_RATE;
  if (shouldFail) {
    throw new Error("결제를 완료하지 못했어요.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    orderNumber: generateOrderNumber(),
    items,
    subtotal,
    total: subtotal,
    orderType,
    store: storeInfo,
    placedAt: new Date().toISOString(),
  };
}
