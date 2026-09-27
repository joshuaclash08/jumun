"use client";

import Link from "next/link";
import { EmptyCartIllustration } from "@/components/ui/TossIllustrations";
import { useTranslation } from "@/lib/i18n";

interface InvalidOrderLinkNoticeProps {
  title?: string;
  description?: string;
}

export function InvalidOrderLinkNotice({
  title,
  description,
}: InvalidOrderLinkNoticeProps) {
  const { t } = useTranslation("orderFlow");

  const resolvedTitle = title ?? t("invalidLink.title");
  const resolvedDesc = description ?? t("invalidLink.desc");

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center bg-background"
    >
      <EmptyCartIllustration size={96} />
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h1 className="text-2xl font-extrabold text-foreground">{resolvedTitle}</h1>
        <p className="text-base font-medium text-muted-foreground leading-relaxed">
          {resolvedDesc}
        </p>
      </div>
      <Link
        href="/order/jumun-cafe-01"
        className="mt-3 inline-flex h-14 items-center justify-center rounded-[14px] bg-primary px-6 font-bold text-primary-foreground shadow-none transition-transform active:scale-[0.96]"
      >
        {t("invalidLink.openSample")}
      </Link>
    </main>
  );
}
