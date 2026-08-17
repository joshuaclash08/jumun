"use client";

import * as React from "react";
import { BackButton } from "@/components/ui/BackButton";

interface SettingsHeaderProps {
  title: string;
}

// Shared back+title bar for every /settings screen -- compact Toss production standard
export function SettingsHeader({ title }: SettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 grid grid-cols-[44px_1fr_44px] items-center h-14 px-4 bg-background/90 backdrop-blur-md">
      <BackButton label="이전 화면으로 돌아가기" className="-ml-1" />
      <h1 className="text-lg sm:text-xl font-bold text-foreground text-center truncate">
        {title}
      </h1>
      <div className="w-11" aria-hidden="true" />
    </header>
  );
}

