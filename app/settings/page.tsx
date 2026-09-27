"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  SettingsHeader,
  SettingsGroup,
  SettingsRow,
  FontScaleSelector,
  OneHandedModeSelector,
  OrderModeSelector,
  ThemeModeSelector,
  MenuLayoutSelector,
} from "@/components/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { cn } from "@/lib/utils";
import { SETUP_COMPLETED_KEY, SETUP_COMPLETED_COOKIE, sanitizeReturnTo } from "@/lib/constants/setup";
import { useTranslation, SUPPORTED_LOCALES, translate, DEFAULT_LOCALE } from "@/lib/i18n";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get?.("returnTo") ?? null;
  const { t, language, setLanguage } = useTranslation("settings");
  const {
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    dyslexiaSpacing,
    setDyslexiaSpacing,
    timeoutExtension,
    setTimeoutExtension,
    voiceGuideEnabled,
    setVoiceGuideEnabled,
    resetAll,
  } = useAccessibilityStore();

  const markSetupDone = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETUP_COMPLETED_KEY, "true");
        document.cookie = `${SETUP_COMPLETED_COOKIE}=true; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {
        console.error("Failed to save setup status:", e);
      }
    }
  };

  const handleToggle = (
    _name: string,
    next: boolean,
    setter: (val: boolean) => void,
  ) => {
    setter(next);
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

  const handleBack = () => {
    markSetupDone();
    if (returnTo) {
      router.replace(sanitizeReturnTo(returnTo));
    } else {
      router.back();
    }
  };

  const handleComplete = () => {
    markSetupDone();
    if (returnTo) {
      router.replace(sanitizeReturnTo(returnTo));
    } else {
      router.back();
    }
  };

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col bg-background pb-28 sm:pb-32"
    >
      <SettingsHeader title={t("title")} onBack={handleBack} />

      <div className="flex flex-col gap-6 px-4 pt-4">
        {/* ── 1. Screen & Typography Section ────────────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            {t("screen.sectionTitle")}
          </h2>
          <SettingsGroup>
            {/* Theme Mode Control (Light vs Dark) */}
            <ThemeModeSelector />

            {/* Font Scale Control */}
            <FontScaleSelector />

            {/* One-Handed Mode Control */}
            <OneHandedModeSelector />

            {/* Order Mode Control (Standard vs Wizard) */}
            <OrderModeSelector />

            {/* Menu Display Style Control (Grid Cards vs Row List) */}
            <MenuLayoutSelector />

            <SettingsRow
              htmlFor="setting-high-contrast"
              label={t("screen.highContrast.label")}
              description={t("screen.highContrast.desc")}
              trailing={
                <Checkbox
                  id="setting-high-contrast"
                  checked={highContrast}
                  onCheckedChange={(checked) =>
                    handleToggle("high-contrast", !!checked, setHighContrast)
                  }
                  aria-label={t("screen.highContrast.label")}
                />
              }
            />

            <SettingsRow
              htmlFor="setting-dyslexia-spacing"
              label={t("screen.dyslexiaSpacing.label")}
              description={t("screen.dyslexiaSpacing.desc")}
              trailing={
                <Checkbox
                  id="setting-dyslexia-spacing"
                  checked={dyslexiaSpacing}
                  onCheckedChange={(checked) =>
                    handleToggle("dyslexia-spacing", !!checked, setDyslexiaSpacing)
                  }
                  aria-label={t("screen.dyslexiaSpacing.label")}
                />
              }
            />

            <SettingsRow
              htmlFor="setting-reduced-motion"
              label={t("screen.reducedMotion.label")}
              description={t("screen.reducedMotion.desc")}
              trailing={
                <Checkbox
                  id="setting-reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={(checked) =>
                    handleToggle("reduced-motion", !!checked, setReducedMotion)
                  }
                  aria-label={t("screen.reducedMotion.label")}
                />
              }
            />
          </SettingsGroup>
        </section>

        {/* ── 2. Feedback & Accessibility Details ───────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            {t("feedback.sectionTitle")}
          </h2>
          <SettingsGroup>
            <SettingsRow
              htmlFor="setting-timeout-extension"
              label={t("feedback.timeoutExtension.label")}
              description={t("feedback.timeoutExtension.desc")}
              trailing={
                <Checkbox
                  id="setting-timeout-extension"
                  checked={timeoutExtension}
                  onCheckedChange={(checked) =>
                    handleToggle("timeout-extension", !!checked, setTimeoutExtension)
                  }
                  aria-label={t("feedback.timeoutExtension.label")}
                />
              }
            />

            <SettingsRow
              htmlFor="setting-voice-guide"
              label={t("feedback.voiceGuide.label")}
              description={t("feedback.voiceGuide.desc")}
              trailing={
                <Checkbox
                  id="setting-voice-guide"
                  checked={voiceGuideEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle("voice-guide", !!checked, setVoiceGuideEnabled)
                  }
                  aria-label={t("feedback.voiceGuide.label")}
                />
              }
            />

            <SettingsRow
              label={t("feedback.paymentMethod.label")}
              href={
                returnTo
                  ? `/settings/payment?returnTo=${encodeURIComponent(returnTo)}`
                  : "/settings/payment"
              }
            />
          </SettingsGroup>
        </section>

        {/* ── 3. Language & Reset ───────────────────────────────────── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            {t("languageAndReset.sectionTitle")}
          </h2>
          <SettingsGroup>
            <div className="flex flex-col gap-3 px-5 py-4">
              <span className="text-base font-bold text-foreground">
                {t("languageAndReset.language")}
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1 bg-muted/40 p-1.5 rounded-[16px]">
                {SUPPORTED_LOCALES.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <motion.button
                      key={item.code}
                      type="button"
                      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() => {
                        setLanguage(item.code);
                      }}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-[12px] font-bold text-base transition-all outline-none",
                        isSelected
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                      )}
                    >
                      {item.nativeName}
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
              {t("languageAndReset.reset")}
            </motion.button>
          </div>
        </section>
      </div>

      <StickyActionBar className="max-w-[840px]">
        <Button size="cta-full" onClick={handleComplete}>
          {t("actions.complete")}
        </Button>
      </StickyActionBar>
    </main>
  );
}

export default function SettingsPage() {
  const loadingLabel = translate(DEFAULT_LOCALE, "common.loading");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-background">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            role="status"
            aria-label={loadingLabel}
          />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
