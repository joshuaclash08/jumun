"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { SettingsHeader, SettingsGroup, SettingsRow } from "@/components/settings";
import { FontScaleSelector } from "@/components/settings/FontScaleSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { toast } from "@/lib/services/A11yFeedbackService";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { id: "ko" as const, label: "한국어" },
  { id: "en" as const, label: "English" },
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    highContrast,
    setHighContrast,
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
    toast({
      kind: "success",
      messageKo: `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`,
      variant: "generic",
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
    toast({
      kind: "success",
      messageKo: "설정이 안전하게 저장되었습니다.",
      variant: "generic",
      hapticsEnabled,
    });
    // Delay navigation so the screen reader finishes reading the live-region
    // announcement before this page unmounts (router.back() was previously
    // firing immediately, cutting the announcement off mid-sentence).
    setTimeout(() => {
      router.back();
    }, 250);
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
            <FontScaleSelector />

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
              <span className="text-base font-bold text-foreground">
                언어 (Language)
              </span>
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
                        toast({
                          kind: "success",
                          messageKo: `언어가 ${item.label}로 설정되었습니다.`,
                          variant: "generic",
                          hapticsEnabled,
                        });
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
              className="flex items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 px-6 py-2.5 text-base font-bold text-destructive hover:bg-destructive/20 transition-colors"
            >
              설정 초기화
            </motion.button>
          </div>
        </section>
      </div>

      <StickyActionBar className="max-w-[768px]">
        <Button size="cta-full" onClick={handleComplete}>
          설정 완료
        </Button>
      </StickyActionBar>
    </main>
  );
}
