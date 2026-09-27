"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SettingsHeader,
  SettingsGroup,
  SettingsRow,
  OneHandedModeSelector,
  OrderModeSelector,
} from "@/components/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import { StickyActionBar } from "@/components/shared/StickyActionBar";

export default function AccessibilityDetailPage() {
  const router = useRouter();
  const {
    dyslexiaSpacing,
    setDyslexiaSpacing,
    hapticsEnabled,
    timeoutExtension,
    setTimeoutExtension,
    voiceGuideEnabled,
    setVoiceGuideEnabled,
  } = useAccessibilityStore();

  const handleToggle = (name: string, next: boolean, setter: (val: boolean) => void) => {
    setter(next);
    toast({
      kind: "success",
      messageKo: `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`,
      variant: "generic",
      hapticsEnabled,
    });
  };

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-28 sm:pb-32">
      <SettingsHeader title="접근성" />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <SettingsGroup>
          <OneHandedModeSelector />
        </SettingsGroup>

        <SettingsGroup>
          <OrderModeSelector />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            htmlFor="detail-voice-guide"
            label="음성 안내 (보이스오버 체험)"
            description="단계별 주문 화면과 메뉴 정보를 브라우저 음성으로 들려줘요"
            trailing={
              <Checkbox
                id="detail-voice-guide"
                checked={voiceGuideEnabled}
                onCheckedChange={(checked) =>
                  handleToggle("음성 안내", !!checked, setVoiceGuideEnabled)
                }
                aria-label="음성 안내 (보이스오버 체험)"
              />
            }
          />
          <SettingsRow
            htmlFor="detail-dyslexia-spacing"
            label="난독증 친화 간격"
            description="글자, 단어, 줄 사이 간격을 넓혀 가독성을 높여요"
            trailing={
              <Checkbox
                id="detail-dyslexia-spacing"
                checked={dyslexiaSpacing}
                onCheckedChange={(checked) =>
                  handleToggle("난독증 친화 간격", !!checked, setDyslexiaSpacing)
                }
                aria-label="난독증 친화 간격"
              />
            }
          />
          <SettingsRow
            htmlFor="detail-timeout-extension"
            label="알림 표시 시간 2배 연장"
            description="알림 토스트가 화면에 머무는 시간을 3초에서 7초로 늘려요"
            trailing={
              <Checkbox
                id="detail-timeout-extension"
                checked={timeoutExtension}
                onCheckedChange={(checked) =>
                  handleToggle("알림 시간 연장", !!checked, setTimeoutExtension)
                }
                aria-label="알림 표시 시간 2배 연장"
              />
            }
          />
        </SettingsGroup>
      </div>

      <StickyActionBar className="max-w-[768px]">
        <Button size="cta-full" onClick={() => router.back()}>
          설정 완료
        </Button>
      </StickyActionBar>
    </main>
  );
}
