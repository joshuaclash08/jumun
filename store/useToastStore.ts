"use client";

import { create } from "zustand";
import type { ToastItem } from "@/lib/types";

interface ToastStoreState {
  toasts: ToastItem[];
  pushToast: (toast: ToastItem) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

// Toast state lives on its own store, decoupled from useCartStore -- toasts
// aren't cart-specific (staff-call, settings toggles, etc. all push here
// too), and every route needs to be able to surface one, not just the menu
// screen. See docs/ux-plan-2026-08-17.md §8.2.
export const useToastStore = create<ToastStoreState>()((set) => ({
  toasts: [],

  // Instant Preemption: When a new toast arrives, replace any existing toast
  // immediately so the user gets real-time feedback without waiting for previous toasts.
  pushToast: (toast) =>
    set({ toasts: [toast] }),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clearAll: () =>
    set({ toasts: [] }),
}));

