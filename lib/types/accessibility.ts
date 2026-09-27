export type AppLanguage = "ko" | "en";
export type OneHandedMode = "none" | "left" | "right";
export type OrderMode = "standard" | "wizard";

export interface AccessibilitySettings {
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
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
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
};
