"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { HandHeart, Sparkles } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SETUP_COMPLETED_KEY, SETUP_COMPLETED_COOKIE, sanitizeReturnTo } from "@/lib/constants/setup";
import { useTranslation, translate, DEFAULT_LOCALE } from "@/lib/i18n";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = sanitizeReturnTo(rawReturnTo);
  const reducedMotion = useAccessibilityStore((s) => s.reducedMotion);
  const { t } = useTranslation("setup");

  const markSetupDone = () => {
    try {
      localStorage.setItem(SETUP_COMPLETED_KEY, "true");
      if (typeof document !== "undefined") {
        document.cookie = `${SETUP_COMPLETED_COOKIE}=true; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Fail silently — the guard will also fail open in this case
    }
  };

  const handleNeedHelp = () => {
    // Navigate to settings, carrying returnTo through so settings can
    // redirect back to the original destination after completion.
    router.push(`/settings?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleNoHelp = () => {
    markSetupDone();
    router.replace(returnTo);
  };

  return (
    <main
      id="main-content"
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6"
    >
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex w-full max-w-[380px] flex-col items-center gap-10"
      >
        {/* ── Icon ──────────────────────────────────────────────────── */}
        <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-secondary">
          <HandHeart
            className="h-10 w-10 text-primary"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        {/* ── Text ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
            {t("title")}
          </h1>
          <p className="text-base font-medium leading-relaxed text-muted-foreground whitespace-pre-line">
            {t("desc")}
          </p>
        </div>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <div className="flex w-full flex-col gap-3">
          {/* Primary: need help → settings */}
          <motion.button
            type="button"
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.096, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleNeedHelp}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[16px] font-bold text-white transition-colors hover:bg-[#0050D9] active:bg-[#003EA8]"
          >
            <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            {t("needHelp")}
          </motion.button>

          {/* Ghost: no help → original page */}
          <motion.button
            type="button"
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.096, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleNoHelp}
            className="flex h-[56px] w-full items-center justify-center rounded-[12px] bg-transparent text-[16px] font-bold text-muted-foreground transition-colors hover:bg-muted/60 active:bg-muted"
          >
            {t("noHelp")}
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

/**
 * /setup — First-run onboarding gate.
 */
export default function SetupPage() {
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
      <SetupContent />
    </Suspense>
  );
}
