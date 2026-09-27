"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Reads the OS-level color scheme preference (iOS, Android, Windows, macOS, etc.) live.
 * The app's actual theme is driven by useAccessibilityStore (seeded from this
 * once on first visit, and independently overridable after by the user).
 */
export function useOSDarkModePreference(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
