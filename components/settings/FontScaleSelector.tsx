"use client";

import * as React from "react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import { SegmentedControl } from "@/components/settings/SegmentedControl";

export const FONT_SCALES = [
  { scale: 1.0, label: "보통" },
  { scale: 1.15, label: "크게" },
  { scale: 1.3, label: "아주 크게" },
];

/**
 * Segmented Control for Global Font Scale Selection in Settings.
 */
export function FontScaleSelector() {
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const setFontScale = useAccessibilityStore((state) => state.setFontScale);

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-base font-bold text-foreground">
          글자 크기
        </span>
        <span className="text-base font-medium text-muted-foreground">
          화면 전체 기본 글꼴 크기를 조절해요
        </span>
      </div>
      <SegmentedControl
        groupLabel="글자 크기 선택"
        options={FONT_SCALES.map((item) => ({ value: item.scale, label: item.label }))}
        value={fontScale}
        onChange={setFontScale}
        getSuccessMessage={(label) => `글자 크기가 ${label}로 변경되었습니다.`}
      />
    </div>
  );
}
