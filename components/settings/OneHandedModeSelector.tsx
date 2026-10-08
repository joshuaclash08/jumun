"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { useTranslation } from "@/lib/i18n";
import type { OneHandedMode } from "@/lib/types";

const ONE_HANDED_CONFIG: { value: OneHandedMode; key: "screen.oneHanded.left" | "screen.oneHanded.none" | "screen.oneHanded.right" }[] = [
  { value: "left", key: "screen.oneHanded.left" },
  { value: "none", key: "screen.oneHanded.none" },
  { value: "right", key: "screen.oneHanded.right" },
];

/**
 * Segmented Control for One-Handed Layout Mode Selection in Settings.
 * Designed for hemiplegic users or single-hand operation.
 */
export function OneHandedModeSelector() {
  const { t } = useTranslation("settings");
  const oneHandedMode = useAccessibilityStore((state) => state.oneHandedMode);
  const setOneHandedMode = useAccessibilityStore((state) => state.setOneHandedMode);

  const options = React.useMemo(
    () =>
      ONE_HANDED_CONFIG.map((item) => ({
        value: item.value,
        label: t(item.key),
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <span className="text-base font-bold text-foreground">
        {t("screen.oneHanded.title")}
      </span>
      <SegmentedControl<OneHandedMode>
        groupLabel={t("screen.oneHanded.groupLabel")}
        options={options}
        value={oneHandedMode}
        onChange={setOneHandedMode}
      />
    </div>
  );
}
