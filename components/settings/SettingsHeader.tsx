"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

// Shared back+title bar for every /settings screen -- mirrors HeaderBar's
// sticky treatment so settings doesn't feel like a different app.
export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="h-11 w-11 shrink-0 rounded-[--radius-md]"
        aria-label="이전 화면으로 돌아가기"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
        {description && (
          <span className="text-xs text-muted-foreground truncate">{description}</span>
        )}
      </div>
    </header>
  );
}
