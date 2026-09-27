"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { useTranslation } from "@/lib/i18n";
import type { AppTheme } from "@/lib/types";

const THEME_CONFIG: {
  value: AppTheme;
  key: "screen.theme.light" | "screen.theme.dark";
  icon: React.ReactNode;
}[] = [
  {
    value: "light",
    key: "screen.theme.light",
    icon: <Sun className="size-4 shrink-0" aria-hidden="true" />,
  },
  {
    value: "dark",
    key: "screen.theme.dark",
    icon: <Moon className="size-4 shrink-0" aria-hidden="true" />,
  },
];

/**
 * Segmented Control for Light / Dark Mode theme selection in Settings.
 * Preserves user's manual choice in localStorage so returning visits
 * never override the user's explicit preference.
 */
export function ThemeModeSelector() {
  const { t } = useTranslation("settings");
  const theme = useAccessibilityStore((state) => state.theme);
  const setTheme = useAccessibilityStore((state) => state.setTheme);

  const options = React.useMemo(
    () =>
      THEME_CONFIG.map((item) => ({
        value: item.value,
        label: t(item.key),
        icon: item.icon,
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          {t("screen.theme.title")}
        </span>
        <span className="text-base font-medium text-muted-foreground">
          {t("screen.theme.desc")}
        </span>
      </div>
      <SegmentedControl<AppTheme>
        groupLabel={t("screen.theme.groupLabel")}
        options={options}
        value={theme}
        onChange={setTheme}
      />
    </div>
  );
}
