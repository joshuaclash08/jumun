"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Contrast, Type, Gauge, Accessibility, Wallet, Languages } from "lucide-react";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsGroup, SettingsRow } from "@/components/settings/SettingsRow";
import { Switch } from "@/components/ui/switch";
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

// Dedicated /settings route, not a popup -- see docs/decisions/0007-settings-as-dedicated-route.md
// for why this departs from ADR 0003's default "sheet, not route" guidance.
export default function SettingsPage() {
  const {
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
    reducedMotion,
    setReducedMotion,
    language,
    setLanguage,
    hapticsEnabled,
  } = useAccessibilityStore();

  const handleToggle = (name: string, current: boolean, setter: (val: boolean) => void) => {
    const next = !current;
    setter(next);
    notify("success", `${name} 설정이 ${next ? "켜졌습니다" : "꺼졌습니다"}.`, { hapticsEnabled });
  };

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background pb-10">
      <SettingsHeader title="설정" />

      <div className="flex flex-col gap-6 px-4 pt-5">
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-bold text-muted-foreground">테마 및 화면</h2>
          <SettingsGroup>
            <SettingsRow
              icon={Contrast}
              label="고대비 모드"
              description="텍스트와 배경의 대비를 17:1 이상으로 높여요"
              trailing={
                <Switch
                  checked={highContrast}
                  onCheckedChange={() => handleToggle("고대비 모드", highContrast, setHighContrast)}
                  aria-label="고대비 모드"
                />
              }
            />

            <div className="flex flex-col gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-sm] bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <Type className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-foreground">글자 크기</span>
                  <span className="text-sm text-muted-foreground">화면 전체 기본 글꼴 크기를 조절해요</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {FONT_SCALES.map((item) => {
                  const isSelected = fontScale === item.scale;
                  return (
                    <motion.div
                      key={item.scale}
                      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          setFontScale(item.scale);
                          notify("success", `글자 크기가 ${item.label}로 변경되었습니다.`, { hapticsEnabled });
                        }}
                        className={cn("w-full font-bold text-sm", !isSelected && "text-foreground hover:bg-muted")}
                      >
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <SettingsRow
              icon={Gauge}
              label="애니메이션 줄이기"
              description="화면 전환 및 장식 애니메이션을 즉시 완료해요"
              trailing={
                <Switch
                  checked={reducedMotion}
                  onCheckedChange={() => handleToggle("애니메이션 줄이기", reducedMotion, setReducedMotion)}
                  aria-label="애니메이션 줄이기"
                />
              }
            />
          </SettingsGroup>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-bold text-muted-foreground">접근성 및 결제</h2>
          <SettingsGroup>
            <SettingsRow
              icon={Accessibility}
              label="접근성"
              description="난독증 친화 간격, 진동, 알림 표시 시간"
              href="/settings/accessibility"
            />
            <SettingsRow
              icon={Wallet}
              label="결제 수단 관리"
              description="주문 시 기본으로 선택될 결제 수단"
              href="/settings/payment"
            />
          </SettingsGroup>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-sm font-bold text-muted-foreground">언어</h2>
          <SettingsGroup>
            <div className="flex flex-col gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-sm] bg-muted text-muted-foreground"
                  aria-hidden="true"
                >
                  <Languages className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-semibold text-foreground">언어</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          setLanguage(item.id);
                          notify("success", `언어가 ${item.label}로 설정되었습니다.`, { hapticsEnabled });
                        }}
                        className={cn("w-full font-bold text-sm", !isSelected && "text-foreground hover:bg-muted")}
                      >
                        {item.label}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </SettingsGroup>
        </section>
      </div>
    </main>
  );
}
