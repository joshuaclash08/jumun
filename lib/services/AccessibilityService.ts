import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import type { AccessibilitySettings } from "@/lib/types";

// Thin wrapper over useAccessibilityStore's vanilla getState/setState for
// non-component call sites (other services, non-React utility code). Inside a
// component, prefer the useAccessibilityStore hook directly for reactivity --
// this reads/writes the same persisted, cross-venue store either way.

export function getSettings(): AccessibilitySettings {
  const state = useAccessibilityStore.getState();
  return {
    theme: state.theme,
    language: state.language,
    highContrast: state.highContrast,
    fontScale: state.fontScale,
    reducedMotion: state.reducedMotion,
    dyslexiaSpacing: state.dyslexiaSpacing,
    hapticsEnabled: state.hapticsEnabled,
    timeoutExtension: state.timeoutExtension,
    oneHandedMode: state.oneHandedMode,
    voiceGuideEnabled: state.voiceGuideEnabled,
    orderMode: state.orderMode,
    menuLayout: state.menuLayout,
  };
}

export function mergeSettings(partial: Partial<AccessibilitySettings>): AccessibilitySettings {
  useAccessibilityStore.setState(partial);
  return getSettings();
}
