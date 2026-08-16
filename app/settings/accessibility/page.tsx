"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CaseSensitive, Vibrate, Clock, ShieldCheck } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";

export default function AccessibilityDetailPage() {
  const router = useRouter();
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
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-32">
      <SettingsHeader title="접근성" description="글자 간격, 진동, 알림 표시 시간" />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <div className="flex items-center gap-3 rounded-[20px] bg-[#E8F3FF] p-4 text-[#0050D9] border border-[#0064FF]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0064FF]/15 text-[#0064FF]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">자동 영구 저장</span>
            <span className="text-base font-medium text-muted-foreground mt-0.5">
              변경된 모든 접근성 설정은 기기에 영구 저장돼요.
            </span>
          </div>
        </div>

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
            description="알림 토스트가 화면에 머무는 시간을 3초에서 7초로 늘려요"
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

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-background/95 border-t border-border/60 p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <div className="w-full max-w-[768px] px-2">
          <Button
            size="lg"
            onClick={() => router.back()}
            className="w-full font-extrabold bg-primary text-white shadow-none hover:bg-primary/95"
          >
            설정 완료
          </Button>
        </div>
      </div>
    </main>
  );
}
