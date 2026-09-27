"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import type {
  Locale,
  LocaleInfo,
  TranslationSchema,
  TranslationParams,
  NestedKeyOf,
} from "./types";
import koCommon from "./locales/ko/common.json";
import koSettings from "./locales/ko/settings.json";
import koSetup from "./locales/ko/setup.json";
import koLanding from "./locales/ko/landing.json";
import koOrderFlow from "./locales/ko/orderFlow.json";
import koMenu from "./locales/ko/menu.json";

import enCommon from "./locales/en/common.json";
import enSettings from "./locales/en/settings.json";
import enSetup from "./locales/en/setup.json";
import enLanding from "./locales/en/landing.json";
import enOrderFlow from "./locales/en/orderFlow.json";
import enMenu from "./locales/en/menu.json";

export * from "./types";

export const DEFAULT_LOCALE: Locale = "ko";

export const SUPPORTED_LOCALES: readonly LocaleInfo[] = [
  { code: "ko", name: "한국어", nativeName: "한국어" },
  { code: "en", name: "English", nativeName: "English" },
] as const;

export const DICTIONARIES: Record<Locale, TranslationSchema> = {
  ko: {
    common: koCommon,
    settings: koSettings,
    setup: koSetup,
    landing: koLanding,
    orderFlow: koOrderFlow,
    menu: koMenu,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    setup: enSetup,
    landing: enLanding,
    orderFlow: enOrderFlow,
    menu: enMenu,
  },
};

/**
 * Resolves a nested value from an object using a dot-delimited path (e.g. "screen.theme.title").
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Simple parameter interpolation for `{param}` tokens.
 */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Pure translation lookup function. Safe to call anywhere (services, server, client, tests).
 * Falls back to DEFAULT_LOCALE ("ko") if the target locale lacks the key.
 */
export function translate(
  locale: Locale | string,
  key: string,
  params?: TranslationParams,
  fallback?: string,
): string {
  const currentLang = (locale in DICTIONARIES ? locale : DEFAULT_LOCALE) as Locale;
  const targetDict = DICTIONARIES[currentLang];
  const fallbackDict = DICTIONARIES[DEFAULT_LOCALE];

  // Try target dictionary
  let resolved = getNestedValue(targetDict, key);

  // Fallback to default locale (Korean) if missing in current locale
  if (resolved === undefined && currentLang !== DEFAULT_LOCALE) {
    resolved = getNestedValue(fallbackDict, key);
  }

  // If still undefined, use explicitly provided fallback or the key itself
  if (resolved === undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Missing translation key "${key}" for locale "${locale}"`);
    }
    resolved = fallback ?? key;
  }

  return interpolate(resolved, params);
}

/**
 * Global static translate helper using DEFAULT_LOCALE unless specified.
 */
export const t = (
  key: string,
  params?: TranslationParams,
  locale: Locale = DEFAULT_LOCALE,
): string => translate(locale, key, params);

/**
 * Primary React hook for consuming translations.
 * Automatically reactive to `language` changes in `useAccessibilityStore`.
 *
 * @example
 * // Full key:
 * const { t } = useTranslation();
 * t("settings.screen.title");
 *
 * // Namespaced:
 * const { t } = useTranslation("settings");
 * t("screen.title");
 */
export function useTranslation<
  Namespace extends keyof TranslationSchema | undefined = undefined,
>(namespace?: Namespace) {
  const language = useAccessibilityStore((state) => state.language);
  const setLanguage = useAccessibilityStore((state) => state.setLanguage);

  type ScopedKey = Namespace extends keyof TranslationSchema
    ? NestedKeyOf<TranslationSchema[Namespace]> | (string & Record<never, never>)
    : NestedKeyOf<TranslationSchema> | (string & Record<never, never>);

  const tFunc = React.useCallback(
    (key: ScopedKey, params?: TranslationParams, fallback?: string) => {
      const fullKey = namespace ? `${namespace}.${String(key)}` : String(key);
      return translate(language, fullKey, params, fallback);
    },
    [language, namespace],
  );

  return {
    t: tFunc,
    language,
    setLanguage,
    supportedLocales: SUPPORTED_LOCALES,
  };
}
