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
  LanguageSelector,
} from "@/components/settings";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { useCartStore } from "@/store/useCartStore";
import { formatKRW, getCartItemDisplayName, getCartTotals } from "@/lib/format";
import { StickyActionBar } from "@/components/shared/StickyActionBar";
import { SETUP_COMPLETED_KEY, SETUP_COMPLETED_COOKIE, sanitizeReturnTo } from "@/lib/constants/setup";
import { useTranslation, translate, DEFAULT_LOCALE } from "@/lib/i18n";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get?.("returnTo") ?? null;
  const { t } = useTranslation("settings");
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
  const lastReceipt = useCartStore((s) => s.lastReceipt);
  const resetOrder = useCartStore((s) => s.resetOrder);

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
        {/* ── 0. Recent Order Summary (if lastReceipt exists) ──────── */}
        {lastReceipt && (
          <>
            <section
              className="flex flex-col gap-2.5"
              aria-label={t("recentOrder.title")}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-extrabold text-foreground">
                  {t("recentOrder.title")}
                </h2>
                <button
                  type="button"
                  onClick={() => resetOrder()}
                  className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {t("recentOrder.clear")}
                </button>
              </div>
              <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-muted-foreground">
                    {t("recentOrder.orderNumber", { number: lastReceipt.orderNumber })}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">
                    {lastReceipt.store?.storeName}
                  </span>
                </div>
                <div className="mt-2 text-base font-bold text-foreground">
                  {lastReceipt.items
                    .map((it) => getCartItemDisplayName(it))
                    .join(", ")}
                </div>
                <div className="mt-1 flex items-center justify-between text-base">
                  <span className="text-muted-foreground">
                    {t("recentOrder.itemsCount", {
                      count: getCartTotals(lastReceipt.items).totalQuantity,
                    })}
                  </span>
                  <span className="font-extrabold text-primary">
                    {formatKRW(lastReceipt.total)}
                  </span>
                </div>
              </div>
            </section>
            <Separator variant="hairline" className="-mx-4 w-[calc(100%+2rem)]" />
          </>
        )}

        {/* ── 1. Screen & Display Settings (Language at top row) ───── */}
        <section className="flex flex-col gap-2.5">
          <h2 className="px-1 text-base font-extrabold text-foreground">
            {t("screen.sectionTitle")}
          </h2>
          <SettingsGroup>
            {/* Language Dropdown Selector (Top Row) */}
            <LanguageSelector />

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
              trailing={
                <Switch
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
                <Switch
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
              trailing={
                <Switch
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

        <Separator variant="hairline" className="-mx-4 w-[calc(100%+2rem)]" />

        {/* ── 3. Feedback & Accessibility Details ───────────────────── */}
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
                <Switch
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
                <Switch
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

        <Separator variant="hairline" className="-mx-4 w-[calc(100%+2rem)]" />

        {/* ── 4. Reset Settings ─────────────────────────────────────── */}
        <section className="flex flex-col items-center justify-center pt-2 pb-1">
          <motion.button
            type="button"
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={handleReset}
            className="flex items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 px-6 py-2.5 text-base font-bold text-destructive hover:bg-destructive/20 transition-colors"
          >
            {t("languageAndReset.reset")}
          </motion.button>
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
