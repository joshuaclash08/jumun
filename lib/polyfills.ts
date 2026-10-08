/**
 * Polyfills for legacy mobile browsers (e.g. iOS 15 Safari on iPhone 6s/7).
 *
 * Safari 15 lacks:
 * - requestIdleCallback / cancelIdleCallback (added in Safari 16.4)
 * - Object.hasOwn (added in Safari 15.4)
 * - Array.prototype.at / String.prototype.at (added in Safari 15.4)
 * - structuredClone (added in Safari 15.4)
 *
 * This file is imported at the top-level application root to ensure all
 * third-party libraries (e.g. React 19, Motion, Radix UI, Zustand) execute
 * safely without runtime syntax or reference errors.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

if (typeof window !== "undefined") {
  // 1. requestIdleCallback & cancelIdleCallback (Safari < 16.4)
  if (!("requestIdleCallback" in window) || typeof (window as any).requestIdleCallback !== "function") {
    (window as any).requestIdleCallback = function (
      callback: (deadline: { readonly didTimeout: boolean; timeRemaining: () => number }) => void,
      options?: { timeout?: number }
    ): number {
      const start = Date.now();
      const timeout = options?.timeout || 50;
      return window.setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, timeout - (Date.now() - start)),
        });
      }, 1);
    };
  }

  if (!("cancelIdleCallback" in window) || typeof (window as any).cancelIdleCallback !== "function") {
    (window as any).cancelIdleCallback = function (id: number): void {
      clearTimeout(id);
    };
  }

  // 2. Object.hasOwn (Safari < 15.4)
  if (typeof Object.hasOwn !== "function") {
    Object.defineProperty(Object, "hasOwn", {
      value: function (obj: object, prop: PropertyKey): boolean {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      },
      configurable: true,
      writable: true,
    });
  }

  // 3. Array.prototype.at (Safari < 15.4)
  if (typeof Array.prototype.at !== "function") {
    Object.defineProperty(Array.prototype, "at", {
      value: function (n: number) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
      },
      configurable: true,
      writable: true,
    });
  }

  // 4. String.prototype.at (Safari < 15.4)
  if (typeof String.prototype.at !== "function") {
    Object.defineProperty(String.prototype, "at", {
      value: function (n: number) {
        n = Math.trunc(n) || 0;
        if (n < 0) n += this.length;
        if (n < 0 || n >= this.length) return undefined;
        return this[n];
      },
      configurable: true,
      writable: true,
    });
  }

  // 5. structuredClone (Safari < 15.4)
  if (typeof (window as any).structuredClone !== "function") {
    (window as any).structuredClone = function <T>(value: T): T {
      if (value === undefined) return undefined as any;
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return value;
      }
    };
  }
}

export {};
