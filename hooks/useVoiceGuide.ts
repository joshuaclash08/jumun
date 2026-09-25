"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

export function useVoiceGuide() {
  const voiceGuideEnabled = useAccessibilityStore((state) => state.voiceGuideEnabled);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const cancel = React.useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = React.useCallback(
    (text: string, options?: { force?: boolean }) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      // If voice guide is disabled and force is not specified, do nothing
      if (!voiceGuideEnabled && !options?.force) {
        return;
      }

      try {
        // Cancel any pending speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ko-KR";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (e) => {
          // If cancelled intentionally, not an error
          if (e.error !== "canceled" && e.error !== "interrupted") {
            console.warn("SpeechSynthesis error:", e.error);
          }
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis failed to speak:", err);
        setIsSpeaking(false);
      }
    },
    [voiceGuideEnabled],
  );

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    voiceGuideEnabled,
  };
}
