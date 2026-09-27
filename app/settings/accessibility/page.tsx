"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SettingsHeader,
  SettingsGroup,
  SettingsRow,
  OneHandedModeSelector,
  OrderModeSelector,
  ThemeModeSelector,
} from "@/components/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { useTranslation } from "@/lib/i18n";

export default function AccessibilityDetailPage() {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const {
    dyslexiaSpacing,
    setDyslexiaSpacing,
    timeoutExtension,
    setTimeoutExtension,
    voiceGuideEnabled,
    setVoiceGuideEnabled,
  } = useAccessibilityStore();

  const handleToggle = (_name: string, next: boolean, setter: (val: boolean) => void) => {
    setter(next);
  };

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-28 sm:pb-32">
      <SettingsHeader title={t("accessibilityDetail.title")} />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <SettingsGroup>
          <ThemeModeSelector />
        </SettingsGroup>

        <SettingsGroup>
          <OneHandedModeSelector />
        </SettingsGroup>

        <SettingsGroup>
          <OrderModeSelector />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            htmlFor="detail-voice-guide"
            label={t("feedback.voiceGuide.label")}
            description={t("feedback.voiceGuide.descDetail")}
            trailing={
              <Checkbox
                id="detail-voice-guide"
                checked={voiceGuideEnabled}
                onCheckedChange={(checked) =>
                  handleToggle("voice-guide", !!checked, setVoiceGuideEnabled)
                }
                aria-label={t("feedback.voiceGuide.label")}
              />
            }
          />
          <SettingsRow
            htmlFor="detail-dyslexia-spacing"
            label={t("screen.dyslexiaSpacing.label")}
            description={t("screen.dyslexiaSpacing.desc")}
            trailing={
              <Checkbox
                id="detail-dyslexia-spacing"
                checked={dyslexiaSpacing}
                onCheckedChange={(checked) =>
                  handleToggle("dyslexia-spacing", !!checked, setDyslexiaSpacing)
                }
                aria-label={t("screen.dyslexiaSpacing.label")}
              />
            }
          />
          <SettingsRow
            htmlFor="detail-timeout-extension"
            label={t("feedback.timeoutExtension.label")}
            description={t("feedback.timeoutExtension.desc")}
            trailing={
              <Checkbox
                id="detail-timeout-extension"
                checked={timeoutExtension}
                onCheckedChange={(checked) =>
                  handleToggle("timeout-extension", !!checked, setTimeoutExtension)
                }
                aria-label={t("feedback.timeoutExtension.label")}
              />
            }
          />
        </SettingsGroup>
      </div>

      <StickyActionBar className="max-w-[840px]">
        <Button size="cta-full" onClick={() => router.back()}>
          {t("actions.complete")}
        </Button>
      </StickyActionBar>
    </main>
  );
}
