"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { HandHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SETUP_COMPLETED_KEY, SETUP_COMPLETED_COOKIE, sanitizeReturnTo } from "@/lib/constants/setup";
import { useTranslation } from "@/lib/i18n";

interface SetupUIProps {
  returnTo: string;
}

function SetupUI({ returnTo }: SetupUIProps) {
  const router = useRouter();
  const reducedMotion = useAccessibilityStore((s) => s.reducedMotion);
  const hydrateThemeFromSystem = useAccessibilityStore((s) => s.hydrateThemeFromSystem);
  const hydrateLanguageFromSystem = useAccessibilityStore((s) => s.hydrateLanguageFromSystem);
  const { t } = useTranslation("setup");

  // First-run gate (/setup): link system theme and language ONCE when user arrives without cookie.
  React.useEffect(() => {
    hydrateThemeFromSystem();
    hydrateLanguageFromSystem();
  }, [hydrateThemeFromSystem, hydrateLanguageFromSystem]);

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
    router.push(`/settings?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleNoHelp = () => {
    markSetupDone();
    router.replace(returnTo);
  };

  return (
    <main
      id="main-content"
      className="flex min-h-[100vh] min-h-[100dvh] flex-col items-center justify-center bg-background px-6"
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex w-full max-w-[380px] flex-col items-center gap-10 opacity-100"
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
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-foreground">
            {t("title")}
          </h1>
        </div>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <div className="flex w-full flex-col gap-3">
          {/* Primary: need help → settings */}
          <Button size="cta-full" onClick={handleNeedHelp} className="touch-manipulation">
            <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            {t("needHelp")}
          </Button>

          {/* Ghost: no help → original page */}
          <Button
            variant="ghost"
            size="cta-full"
            onClick={handleNoHelp}
            className="text-muted-foreground touch-manipulation"
          >
            {t("noHelp")}
          </Button>
        </div>
      </motion.div>
    </main>
  );
}

function SetupWithParams() {
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = sanitizeReturnTo(rawReturnTo);
  return <SetupUI returnTo={returnTo} />;
}

/**
 * /setup — First-run onboarding gate.
 *
 * Uses <SetupUI returnTo="/" /> as the Suspense fallback so SSR delivers the real UI
 * immediately with ZERO spinner flash. When useSearchParams resolves on client,
 * returnTo is automatically updated.
 */
export default function SetupPage() {
  return (
    <Suspense fallback={<SetupUI returnTo="/" />}>
      <SetupWithParams />
    </Suspense>
  );
}
