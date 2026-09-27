"use client";

import * as React from "react";
import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  SETUP_COMPLETED_KEY,
  SETUP_COMPLETED_COOKIE,
  SETUP_PATH,
  isSetupExemptPath,
} from "@/lib/constants/setup";

/**
 * Client-side guard that redirects first-time visitors to /setup.
 *
 * localStorage is a browser-only API, so this cannot be a server-side
 * proxy/middleware — it must run as a client component. The guard checks
 * for the presence of `jumun:setup-completed` in localStorage; when the
 * key is absent the visitor is redirected to `/setup?returnTo=<current>`.
 *
 * The `/setup` and `/settings` routes are exempted from this guard:
 * - `/setup` allows first-time onboarding to run without infinite loops.
 * - `/settings` allows users who tapped "네, 설정할래요" to view and configure
 *   their preferences without being immediately bounced back to `/setup`.
 *
 * Uses window.location.search inside useEffect instead of useSearchParams()
 * to prevent CSR-bailout errors during Next.js prerendering of error/static pages.
 */
const emptySubscribe = () => () => {};

export function SetupGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const isExempt = isSetupExemptPath(pathname);

  // useSyncExternalStore safely reads localStorage on client and defaults to true on server
  const isSetupDone = React.useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return Boolean(localStorage.getItem(SETUP_COMPLETED_KEY));
      } catch {
        return true;
      }
    },
    () => true // SSR: renders children immediately for instant LCP
  );

  const shouldRenderChildren = isExempt || isSetupDone;

  useEffect(() => {
    if (isExempt) return;

    try {
      const done = localStorage.getItem(SETUP_COMPLETED_KEY);
      if (done && typeof document !== "undefined" && !document.cookie.includes(SETUP_COMPLETED_COOKIE)) {
        document.cookie = `${SETUP_COMPLETED_COOKIE}=true; path=/; max-age=31536000; SameSite=Lax`;
      }
      if (!done) {
        const search =
          typeof window !== "undefined" ? window.location.search : "";
        const fullPath = search ? `${pathname}${search}` : pathname;
        router.replace(
          `${SETUP_PATH}?returnTo=${encodeURIComponent(fullPath)}`,
        );
      }
    } catch {
      // localStorage unavailable (e.g. incognito Safari quota exceeded) — fail open
    }
  }, [pathname, router, isExempt]);

  // While redirecting on first-time visit, show minimal spinner
  if (!shouldRenderChildren) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label={t("loading")}
        />
      </div>
    );
  }

  return <>{children}</>;
}
