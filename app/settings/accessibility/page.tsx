"use client";

import * as React from "react";
import { CaseSensitive, Vibrate, Clock } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";
import { Switch } from "@/components/ui/switch";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";

export default function AccessibilityDetailPage() {
  const {
    dyslexiaSpacing,
    setDyslexiaSpacing,
    hapticsEnabled,
    setHapticsEnabled,
    timeoutExtension,
    setTimeoutExtension,
  } = useAccessibilityStore();

  const handleToggle = (name: string, current: boolean, setter: (val: boolean) => void) => {
    const next = !current;
    setter(next);
    notify("success", `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`, { hapticsEnabled });
  };

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-10">
      <SettingsHeader title="접근성" description="글자 간격, 진동, 알림 표시 시간" />

      <div className="flex flex-col gap-6 px-4 pt-5">
        <SettingsGroup>
          <SettingsRow
            icon={CaseSensitive}
            label="난독증 친화 간격"
            description="글자, 단어, 줄 사이 간격을 넓혀 가독성을 높여요"
            trailing={
              <Switch
                checked={dyslexiaSpacing}
                onCheckedChange={() => handleToggle("난독증 친화 간격", dyslexiaSpacing, setDyslexiaSpacing)}
                aria-label="난독증 친화 간격"
              />
            }
          />
          <SettingsRow
            icon={Vibrate}
            label="진동 피드백"
            description="담기, 삭제, 결제 시 손끝으로 진동을 전달해요"
            trailing={
              <Switch
                checked={hapticsEnabled}
                onCheckedChange={() => handleToggle("진동 피드백", hapticsEnabled, setHapticsEnabled)}
                aria-label="진동 피드백"
              />
            }
          />
          <SettingsRow
            icon={Clock}
            label="알림 표시 시간 2배 연장"
            description="화면 하단 알림이 머무는 시간을 4초에서 8초로 늘려요"
            trailing={
              <Switch
                checked={timeoutExtension}
                onCheckedChange={() => handleToggle("알림 시간 연장", timeoutExtension, setTimeoutExtension)}
                aria-label="알림 표시 시간 2배 연장"
              />
            }
          />
        </SettingsGroup>
      </div>
    </main>
  );
}
