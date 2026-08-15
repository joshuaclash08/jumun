export type AppLanguage = "ko" | "en";

export interface AccessibilitySettings {
  language: AppLanguage;
  highContrast: boolean;
  fontScale: number;
  reducedMotion: boolean;
  dyslexiaSpacing: boolean;
  hapticsEnabled: boolean;
  timeoutExtension: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  language: "ko",
  highContrast: false,
  fontScale: 1,
  reducedMotion: false,
  dyslexiaSpacing: false,
  hapticsEnabled: true,
  timeoutExtension: false,
};
