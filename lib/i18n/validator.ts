import { DICTIONARIES, DEFAULT_LOCALE } from "./index";
import type { Locale } from "./types";

export interface ValidationReport {
  locale: Locale;
  missingKeys: string[];
  extraKeys: string[];
  tokenMismatches: { key: string; baseTokens: string[]; targetTokens: string[] }[];
  isValid: boolean;
}

function extractTokens(template: string): string[] {
  const matches = template.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1)).sort();
}

function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenKeys(value as Record<string, unknown>, fullKey),
      );
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Validates a target locale against the base locale dictionary for 100% key parity and placeholder tokens.
 */
export function validateLocale(
  targetLocale: Locale,
  baseLocale: Locale = DEFAULT_LOCALE,
): ValidationReport {
  const baseDict = DICTIONARIES[baseLocale];
  const targetDict = DICTIONARIES[targetLocale];

  const baseFlat = flattenKeys(baseDict as unknown as Record<string, unknown>);
  const targetFlat = flattenKeys(targetDict as unknown as Record<string, unknown>);

  const baseKeys = new Set(Object.keys(baseFlat));
  const targetKeys = new Set(Object.keys(targetFlat));

  const missingKeys: string[] = [];
  const extraKeys: string[] = [];
  const tokenMismatches: ValidationReport["tokenMismatches"] = [];

  for (const key of baseKeys) {
    if (!targetKeys.has(key)) {
      missingKeys.push(key);
    } else {
      const baseTokens = extractTokens(baseFlat[key]);
      const targetTokens = extractTokens(targetFlat[key]);
      if (baseTokens.join(",") !== targetTokens.join(",")) {
        tokenMismatches.push({
          key,
          baseTokens,
          targetTokens,
        });
      }
    }
  }

  for (const key of targetKeys) {
    if (!baseKeys.has(key)) {
      extraKeys.push(key);
    }
  }

  return {
    locale: targetLocale,
    missingKeys,
    extraKeys,
    tokenMismatches,
    isValid:
      missingKeys.length === 0 &&
      extraKeys.length === 0 &&
      tokenMismatches.length === 0,
  };
}

/**
 * Validates all registered locales against DEFAULT_LOCALE.
 */
export function validateAllLocales(): Record<Locale, ValidationReport> {
  const locales = Object.keys(DICTIONARIES) as Locale[];
  const reports = {} as Record<Locale, ValidationReport>;

  for (const loc of locales) {
    if (loc === DEFAULT_LOCALE) continue;
    reports[loc] = validateLocale(loc, DEFAULT_LOCALE);
  }

  return reports;
}
