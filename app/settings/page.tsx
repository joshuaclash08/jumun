"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

const FONT_SCALES = [
  { scale: 1.0, label: "보통" },
  { scale: 1.15, label: "크게" },
  { scale: 1.3, label: "아주 크게" },
];

const LANGUAGES = [
  { id: "ko" as const, label: "한국어" },
  { id: "en" as const, label: "English" },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
    reducedMotion,
    setReducedMotion,
    dyslexiaSpacing,
    setDyslexiaSpacing,
    hapticsEnabled,
    setHapticsEnabled,
    timeoutExtension,
    setTimeoutExtension,
    language,
    setLanguage,
    resetAll,
  } = useAccessibilityStore();

  const handleToggle = (
    name: string,
    next: boolean,
    setter: (val: boolean) => void,
  ) => {
    setter(next);
    notify("success", `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`, {
      hapticsEnabled,
    });
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage?.clear();
      } catch (e) {
        console.error("Failed to clear storage:", e);
      }
      resetAll();
      router.push("/");
    }
  };

  const handleComplete = () => {
    notify("success", "설정이 안전하게 저장되었습니다.", { hapticsEnabled });
    router.back();
  };

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col bg-background pb-28 sm:pb-32"
    >
      <SettingsHeader title="설정" />

      <div className="flex flex-col gap-6 px-4 pt-4">
        {/* ── 1. Screen & Typography Section ────────────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            화면 및 텍스트 상세 설정
          </h2>
          <SettingsGroup>
            {/* Font Scale Control */}
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-foreground">
                  글자 크기
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  화면 전체 기본 글꼴 크기를 조절해요
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 bg-muted/40 p-1.5 rounded-[16px]">
                {FONT_SCALES.map((item) => {
                  const isSelected = fontScale === item.scale;
                  return (
                    <motion.button
                      key={item.scale}
                      type="button"
                      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() => {
                        setFontScale(item.scale);
                        notify(
                          "success",
                          `글자 크기가 ${item.label}로 변경되었습니다.`,
                          {
                            hapticsEnabled,
                          },
                        );
                      }}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-[12px] font-bold text-base transition-all outline-none",
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                      )}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <SettingsRow
              htmlFor="setting-high-contrast"
              label="고대비 모드"
              description="텍스트와 배경의 대비를 17:1 이상으로 높여요"
              trailing={
                <Checkbox
                  id="setting-high-contrast"
                  checked={highContrast}
                  onCheckedChange={(checked) =>
                    handleToggle("고대비 모드", !!checked, setHighContrast)
                  }
                  aria-label="고대비 모드"
                />
              }
            />

            <SettingsRow
              htmlFor="setting-dyslexia-spacing"
              label="난독증 친화 간격"
              description="글자, 단어, 줄 사이 간격을 넓혀 가독성을 높여요"
              trailing={
                <Checkbox
                  id="setting-dyslexia-spacing"
                  checked={dyslexiaSpacing}
                  onCheckedChange={(checked) =>
                    handleToggle(
                      "난독증 친화 간격",
                      !!checked,
                      setDyslexiaSpacing,
                    )
                  }
                  aria-label="난독증 친화 간격"
                />
              }
            />

            <SettingsRow
              htmlFor="setting-reduced-motion"
              label="애니메이션 줄이기"
              description="화면 전환 및 장식 애니메이션을 즉시 완료해요"
              trailing={
                <Checkbox
                  id="setting-reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={(checked) =>
                    handleToggle(
                      "애니메이션 줄이기",
                      !!checked,
                      setReducedMotion,
                    )
                  }
                  aria-label="애니메이션 줄이기"
                />
              }
            />
          </SettingsGroup>
        </section>

        {/* ── 2. Feedback & Accessibility Details ───────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            피드백 및 편의
          </h2>
          <SettingsGroup>
            <SettingsRow
              htmlFor="setting-haptics"
              label="진동 피드백"
              description="담기, 삭제, 결제 시 손끝으로 햅틱 진동을 전달해요"
              trailing={
                <Checkbox
                  id="setting-haptics"
                  checked={hapticsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("진동 피드백", !!checked, setHapticsEnabled)
                  }
                  aria-label="진동 피드백"
                />
              }
            />

            <SettingsRow
              htmlFor="setting-timeout-extension"
              label="알림 표시 시간 2배 연장"
              description="알림 토스트가 화면에 머무는 시간을 3초에서 7초로 늘려요"
              trailing={
                <Checkbox
                  id="setting-timeout-extension"
                  checked={timeoutExtension}
                  onCheckedChange={(checked) =>
                    handleToggle(
                      "알림 시간 연장",
                      !!checked,
                      setTimeoutExtension,
                    )
                  }
                  aria-label="알림 표시 시간 2배 연장"
                />
              }
            />

            <SettingsRow
              label="기본 결제 수단 관리"
              description="주문 결제 시 기본으로 선택될 수단 (신용카드 / 간편결제)"
              href="/settings/payment"
            />
          </SettingsGroup>
        </section>

        {/* ── 3. Language & Reset ───────────────────────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            언어 및 초기화
          </h2>
          <SettingsGroup>
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-foreground">
                  언어 (Language)
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  앱 표시 언어를 선택해요
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 bg-muted/40 p-1.5 rounded-[16px]">
                {LANGUAGES.map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() => {
                        setLanguage(item.id);
                        notify(
                          "success",
                          `언어가 ${item.label}로 설정되었습니다.`,
                          {
                            hapticsEnabled,
                          },
                        );
                      }}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-[12px] font-bold text-base transition-all outline-none",
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                      )}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </SettingsGroup>

          {/* Reset Button */}
          <div className="flex justify-center pt-3">
            <motion.button
              type="button"
              whileTap={reducedMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={handleReset}
              className="flex items-center justify-center rounded-full bg-[#FEEBE8] border border-[#F04452]/20 px-6 py-2.5 text-base font-bold text-[#F04452] hover:bg-[#FDD8D5] transition-colors"
            >
              설정 초기화
            </motion.button>
          </div>
        </section>
      </div>

      {/* ── Fixed Bottom Action Bar (Toss Standard with Progressive Blur Fade) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center">
        <div className="w-full max-w-[768px] pointer-events-auto flex flex-col pt-7 px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_80%,transparent_100%)]">
          <Button
            size="lg"
            onClick={handleComplete}
            className="w-full h-14 min-h-[56px] font-extrabold bg-primary text-white shadow-none hover:bg-primary/95 rounded-[16px]"
          >
            설정 완료
          </Button>
        </div>
      </div>
    </main>
  );
}
