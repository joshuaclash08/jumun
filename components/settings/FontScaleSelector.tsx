"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { useTranslation } from "@/lib/i18n";

export const FONT_SCALE_CONFIG = [
  { scale: 1.0, key: "screen.fontScale.normal" as const },
  { scale: 1.15, key: "screen.fontScale.large" as const },
  { scale: 1.3, key: "screen.fontScale.xlarge" as const },
] as const;

/**
 * Segmented Control for Global Font Scale Selection in Settings.
 */
export function FontScaleSelector() {
  const { t } = useTranslation("settings");
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const setFontScale = useAccessibilityStore((state) => state.setFontScale);

  const options = React.useMemo(
    () =>
      FONT_SCALE_CONFIG.map((item) => ({
        value: item.scale,
        label: t(item.key),
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          {t("screen.fontScale.title")}
        </span>
        <span className="text-base font-medium text-muted-foreground">
          {t("screen.fontScale.desc")}
        </span>
      </div>
      <SegmentedControl
        groupLabel={t("screen.fontScale.groupLabel")}
        options={options}
        value={fontScale}
        onChange={setFontScale}
      />
    </div>
  );
}
