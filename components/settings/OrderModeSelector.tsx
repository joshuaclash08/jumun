"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { useTranslation } from "@/lib/i18n";
import type { OrderMode } from "@/lib/types";

const ORDER_MODE_CONFIG: { value: OrderMode; key: "screen.orderMode.standard" | "screen.orderMode.wizard" }[] = [
  { value: "standard", key: "screen.orderMode.standard" },
  { value: "wizard", key: "screen.orderMode.wizard" },
];

/**
 * Segmented Control for choosing between Standard Catalog browsing
 * and Step-by-Step (Wizard) ordering mode in Settings.
 */
export function OrderModeSelector() {
  const { t } = useTranslation("settings");
  const orderMode = useAccessibilityStore((state) => state.orderMode);
  const setOrderMode = useAccessibilityStore((state) => state.setOrderMode);

  const options = React.useMemo(
    () =>
      ORDER_MODE_CONFIG.map((item) => ({
        value: item.value,
        label: t(item.key),
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          {t("screen.orderMode.title")}
        </span>
        <span className="text-base font-medium text-muted-foreground">
          {t("screen.orderMode.desc")}
        </span>
      </div>
      <SegmentedControl<OrderMode>
        groupLabel={t("screen.orderMode.groupLabel")}
        options={options}
        value={orderMode}
        onChange={setOrderMode}
      />
    </div>
  );
}
