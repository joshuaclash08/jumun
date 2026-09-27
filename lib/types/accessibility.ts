export type AppLanguage = "ko" | "en";
export type OneHandedMode = "none" | "left" | "right";
export type OrderMode = "standard" | "wizard";
export type AppTheme = "light" | "dark";
export type MenuLayout = "grid" | "list";

export interface AccessibilitySettings {
  theme: AppTheme;
  language: AppLanguage;
  highContrast: boolean;
  fontScale: number;
  reducedMotion: boolean;
  dyslexiaSpacing: boolean;
  hapticsEnabled: boolean;
  timeoutExtension: boolean;
  oneHandedMode: OneHandedMode;
  voiceGuideEnabled: boolean;
  orderMode: OrderMode;
  menuLayout: MenuLayout;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  theme: "light",
  language: "ko",
  highContrast: false,
  fontScale: 1,
  reducedMotion: false,
  dyslexiaSpacing: false,
  hapticsEnabled: true,
  timeoutExtension: false,
  oneHandedMode: "none",
  voiceGuideEnabled: false,
  orderMode: "standard",
  menuLayout: "grid",
};
