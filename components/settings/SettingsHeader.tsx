"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

interface SettingsHeaderProps {
  title: string;
}

// Shared back+title bar for every /settings screen -- compact Toss production standard
export function SettingsHeader({ title }: SettingsHeaderProps) {
  const router = useRouter();
  const reduceMotion = useAccessibilityStore((state) => state.reducedMotion);

  return (
    <header className="sticky top-0 z-40 grid grid-cols-[40px_1fr_40px] items-center h-14 px-4 bg-background/90 backdrop-blur-md">
      <motion.div
        whileTap={reduceMotion ? undefined : { scale: 0.90 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 shrink-0 rounded-full bg-background/85 hover:bg-background text-foreground backdrop-blur-md shadow-sm border border-border/50 flex items-center justify-center -ml-1"
          aria-label="이전 화면으로 돌아가기"
        >
          <ChevronLeft className="size-6 stroke-[2.5]" aria-hidden="true" />
        </Button>
      </motion.div>
      <h1 className="text-lg sm:text-xl font-bold text-foreground text-center truncate">
        {title}
      </h1>
      <div className="w-10" aria-hidden="true" />
    </header>
  );
}
