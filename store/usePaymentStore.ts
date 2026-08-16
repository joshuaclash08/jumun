"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PaymentMethod = "card" | "easy-pay";

interface PaymentStore {
  defaultMethod: PaymentMethod;
  setDefaultMethod: (method: PaymentMethod) => void;
}

// Phase 1 has no real payment processing (PRODUCT.md) -- this only persists
// which of the two mocked methods CheckoutSheet should preselect, not any
// real card/account credential.
export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      defaultMethod: "card",
      setDefaultMethod: (defaultMethod) => set({ defaultMethod }),
    }),
    { name: "jumun:payment-settings" },
  ),
);
