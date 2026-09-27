#!/usr/bin/env bun
/**
 * Maintenance & CI Verification Script for i18n dictionaries.
 * Checks for missing keys, extra keys, and variable token mismatches across all supported languages.
 */
import { validateAllLocales } from "../lib/i18n/validator";

console.log("🔍 Checking internationalization (i18n) key parity across all locales...\n");

const reports = validateAllLocales();
let hasErrors = false;

for (const [locale, report] of Object.entries(reports)) {
  console.log(`[Locale: ${locale}]`);

  if (report.isValid) {
    console.log(`  ✅ 100% key parity with base locale. No missing or extra keys.`);
  } else {
    hasErrors = true;
    if (report.missingKeys.length > 0) {
      console.error(`  ❌ Missing ${report.missingKeys.length} keys:`);
      for (const k of report.missingKeys) {
        console.error(`     - ${k}`);
      }
    }
    if (report.extraKeys.length > 0) {
      console.warn(`  ⚠️  Extra ${report.extraKeys.length} keys (not in base locale):`);
      for (const k of report.extraKeys) {
        console.warn(`     - ${k}`);
      }
    }
    if (report.tokenMismatches.length > 0) {
      console.error(`  ❌ Parameter token mismatches in ${report.tokenMismatches.length} keys:`);
      for (const tm of report.tokenMismatches) {
        console.error(`     - ${tm.key} (base: [${tm.baseTokens.join(", ")}], target: [${tm.targetTokens.join(", ")}])`);
      }
    }
  }
  console.log("");
}

if (hasErrors) {
  console.error("💥 i18n validation failed! Please fix the errors listed above.\n");
  process.exit(1);
} else {
  console.log("✨ All i18n locales are strictly synchronized and valid!\n");
  process.exit(0);
}
