"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { notify } from "@/lib/services/A11yFeedbackService";
import { cn } from "@/lib/utils";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
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
  } = useAccessibilityStore();

  const handleToggle = (
    name: string,
    current: boolean,
    setter: (val: boolean) => void
  ) => {
    const next = !current;
    setter(next);
    notify("success", `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`, {
      hapticsEnabled,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left border-b pb-4">
          <DrawerTitle className="text-2xl font-bold text-foreground">
            접근성 및 환경 설정
          </DrawerTitle>
          <DrawerDescription className="text-base text-muted-foreground">
            모든 설정은 이 기기에 안전하게 저장되어 다음 방문 시에도 유지됩니다.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="flex flex-col gap-6">
            {/* 1. AAA High Contrast */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">
                  고대비 모드 (AAA)
                </span>
                <span className="text-sm text-muted-foreground">
                  텍스트와 배경의 대비를 17:1 이상으로 높입니다.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={highContrast}
                aria-label="고대비 모드 (AAA)"
                onClick={() =>
                  handleToggle("고대비 모드", highContrast, setHighContrast)
                }
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring outline-none",
                  highContrast ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    highContrast ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 2. Font Scale */}
            <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">글자 크기</span>
                <span className="text-sm text-muted-foreground">
                  화면 전체의 기본 글꼴 크기를 확대합니다.
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { scale: 1.0, label: "보통 (100%)" },
                  { scale: 1.15, label: "크게 (115%)" },
                  { scale: 1.3, label: "아주 크게 (130%)" },
                ].map((item) => {
                  const isSelected = fontScale === item.scale;
                  return (
                    <button
                      key={item.scale}
                      type="button"
                      onClick={() => {
                        setFontScale(item.scale);
                        notify(
                          "success",
                          `글자 크기가 ${item.label}로 변경되었습니다.`,
                          { hapticsEnabled }
                        );
                      }}
                      className={cn(
                        "h-12 rounded-xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-ring outline-none border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-surface text-foreground hover:bg-surface/80"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Reduced Motion */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">
                  애니메이션 줄이기
                </span>
                <span className="text-sm text-muted-foreground">
                  화면 전환 및 장식 애니메이션을 즉시 완료되도록 설정합니다.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                aria-label="애니메이션 줄이기"
                onClick={() =>
                  handleToggle("애니메이션 줄이기", reducedMotion, setReducedMotion)
                }
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring outline-none",
                  reducedMotion ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    reducedMotion ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 4. Dyslexia Spacing */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">
                  난독증 친화 간격
                </span>
                <span className="text-sm text-muted-foreground">
                  글자, 단어, 줄 사이 간격을 넓혀 가독성을 높입니다.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={dyslexiaSpacing}
                aria-label="난독증 친화 간격"
                onClick={() =>
                  handleToggle(
                    "난독증 친화 간격",
                    dyslexiaSpacing,
                    setDyslexiaSpacing
                  )
                }
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring outline-none",
                  dyslexiaSpacing ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    dyslexiaSpacing ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 5. Haptic Feedback */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">
                  진동 피드백 (햅틱)
                </span>
                <span className="text-sm text-muted-foreground">
                  담기, 삭제, 결제 시 손끝으로 진동 반응을 전달합니다.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hapticsEnabled}
                aria-label="진동 피드백 (햅틱)"
                onClick={() =>
                  handleToggle("진동 피드백", hapticsEnabled, setHapticsEnabled)
                }
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring outline-none",
                  hapticsEnabled ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    hapticsEnabled ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* 6. Language */}
            <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgba(33,30,26,0.06)]">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">언어 (Language)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: "ko" as const, label: "한국어" },
                  { id: "en" as const, label: "English" },
                ].map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setLanguage(item.id);
                        notify("success", `언어가 ${item.label}로 설정되었습니다.`, {
                          hapticsEnabled,
                        });
                      }}
                      className={cn(
                        "h-12 rounded-xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-ring outline-none border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-foreground hover:bg-surface/80"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
