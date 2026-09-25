"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";
import type { OneHandedMode } from "@/lib/types";

export const ONE_HANDED_OPTIONS: { value: OneHandedMode; label: string }[] = [
  { value: "none", label: "기본(양손)" },
  { value: "left", label: "왼손 모드" },
  { value: "right", label: "오른손 모드" },
];

/**
 * Segmented Control for One-Handed Layout Mode Selection in Settings.
 * Designed for hemiplegic users or single-hand operation.
 */
export function OneHandedModeSelector() {
  const oneHandedMode = useAccessibilityStore((state) => state.oneHandedMode);
  const setOneHandedMode = useAccessibilityStore((state) => state.setOneHandedMode);

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          한손 조작 모드 (편마비 맞춤)
        </span>
        <span className="text-base font-medium text-muted-foreground">
          버튼과 카드를 엄지가 닿기 쉬운 한쪽 방향으로 밀착 배치해요
        </span>
      </div>
      <SegmentedControl<OneHandedMode>
        groupLabel="한손 조작 방향 선택"
        options={ONE_HANDED_OPTIONS}
        value={oneHandedMode}
        onChange={setOneHandedMode}
        getSuccessMessage={(label) => `한손 조작이 ${label}(으)로 설정되었습니다.`}
      />
    </div>
  );
}
