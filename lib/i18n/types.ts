import type { AppLanguage } from "@/lib/types";
import type koCommon from "./locales/ko/common.json";
import type koSettings from "./locales/ko/settings.json";
import type koSetup from "./locales/ko/setup.json";
import type koLanding from "./locales/ko/landing.json";
import type koOrderFlow from "./locales/ko/orderFlow.json";
import type koMenu from "./locales/ko/menu.json";

export type Locale = AppLanguage;

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
}

export type TranslationSchema = {
  common: typeof koCommon;
  settings: typeof koSettings;
  setup: typeof koSetup;
  landing: typeof koLanding;
  orderFlow: typeof koOrderFlow;
  menu: typeof koMenu;
};

// Recursive dot-notation paths for full type-safety
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey =
  | NestedKeyOf<TranslationSchema>
  | (string & Record<never, never>);

export type TranslationParams = Record<string, string | number>;

export type TranslateFunction = (
  key: string,
  params?: TranslationParams,
  fallback?: string,
) => string;
