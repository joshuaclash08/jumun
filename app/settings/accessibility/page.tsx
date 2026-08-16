"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";
import { Checkbox } from "@/components/ui/checkbox";
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

  const handleToggle = (name: string, next: boolean, setter: (val: boolean) => void) => {
    setter(next);
    notify("success", `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`, { hapticsEnabled });
  };

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-28 sm:pb-32">
      <SettingsHeader title="접근성" />

      <div className="flex flex-col gap-5 px-4 pt-5">
        <div className="flex flex-col gap-1 rounded-[20px] bg-[#E8F3FF] p-4.5 border border-[#0064FF]/15">
          <span className="text-base font-bold text-foreground">자동 영구 저장</span>
          <span className="text-base font-medium text-muted-foreground">
            변경된 모든 접근성 설정은 기기에 영구 저장돼요.
          </span>
        </div>

        <SettingsGroup>
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
            htmlFor="detail-haptics"
            label="진동 피드백"
            description="담기, 삭제, 결제 시 손끝으로 진동을 전달해요"
            trailing={
              <Checkbox
                id="detail-haptics"
                checked={hapticsEnabled}
                onCheckedChange={(checked) =>
                  handleToggle("진동 피드백", !!checked, setHapticsEnabled)
                }
                aria-label="진동 피드백"
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

      {/* ── Fixed Bottom Action Bar (Toss Standard with Progressive Blur Fade) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center">
        <div className="w-full max-w-[768px] pointer-events-auto flex flex-col pt-7 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_80%,transparent_100%)]">
          <Button
            size="lg"
            onClick={() => router.back()}
            className="w-full h-14 min-h-[56px] font-extrabold bg-primary text-white shadow-none hover:bg-primary/95 rounded-[16px]"
          >
            설정 완료
          </Button>
        </div>
      </div>
    </main>
  );
}
