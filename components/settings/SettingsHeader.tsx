"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

// Shared back+title bar for every /settings screen -- mirrors HeaderBar's
// sticky treatment with tactile spring back button
export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/40 bg-background px-4 py-3">
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.90 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-12 w-12 shrink-0 rounded-full text-foreground hover:bg-muted -ml-1.5"
          aria-label="이전 화면으로 돌아가기"
        >
          <ChevronLeft className="h-7 w-7 stroke-[2.8]" aria-hidden="true" />
        </Button>
      </motion.div>
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
        {description && (
          <span className="text-base text-muted-foreground truncate">{description}</span>
        )}
      </div>
    </header>
  );
}

