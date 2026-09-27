"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import type { OrderMode } from "@/lib/types";

export const ORDER_MODE_OPTIONS: { value: OrderMode; label: string }[] = [
  { value: "standard", label: "일반 메뉴판" },
  { value: "wizard", label: "단계별 주문" },
];

/**
 * Segmented Control for choosing between Standard Catalog browsing
 * and Step-by-Step (Wizard) ordering mode in Settings.
 */
export function OrderModeSelector() {
  const orderMode = useAccessibilityStore((state) => state.orderMode);
  const setOrderMode = useAccessibilityStore((state) => state.setOrderMode);

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          주문 화면 방식
        </span>
        <span className="text-base font-medium text-muted-foreground">
          한 화면에 전체 메뉴를 둘러볼지, 단계별로 하나씩 집중 선택할지 정해요
        </span>
      </div>
      <SegmentedControl<OrderMode>
        groupLabel="주문 화면 방식 선택"
        options={ORDER_MODE_OPTIONS}
        value={orderMode}
        onChange={setOrderMode}
        getSuccessMessage={(label) => `주문 방식이 ${label}(으)로 변경되었습니다.`}
      />
    </div>
  );
}
