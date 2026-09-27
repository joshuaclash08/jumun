"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import { useTranslation } from "@/lib/i18n";
import type { MenuLayout } from "@/lib/types";

const MENU_LAYOUT_CONFIG: { value: MenuLayout; key: "screen.menuLayout.grid" | "screen.menuLayout.list" }[] = [
  { value: "grid", key: "screen.menuLayout.grid" },
  { value: "list", key: "screen.menuLayout.list" },
];

/**
 * Segmented Control for selecting between 2-column Grid Cards
 * and 1-column accessible Horizontal Row List in Settings.
 */
export function MenuLayoutSelector() {
  const { t } = useTranslation("settings");
  const menuLayout = useAccessibilityStore((state) => state.menuLayout);
  const setMenuLayout = useAccessibilityStore((state) => state.setMenuLayout);

  const options = React.useMemo(
    () =>
      MENU_LAYOUT_CONFIG.map((item) => ({
        value: item.value,
        label: t(item.key),
      })),
    [t],
  );

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          {t("screen.menuLayout.title")}
        </span>
        <span className="text-base font-medium text-muted-foreground">
          {t("screen.menuLayout.desc")}
        </span>
      </div>
      <SegmentedControl<MenuLayout>
        groupLabel={t("screen.menuLayout.groupLabel")}
        options={options}
        value={menuLayout}
        onChange={setMenuLayout}
      />
    </div>
  );
}
