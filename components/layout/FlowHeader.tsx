"use client";

import * as React from "react";
import { BackButton } from "@/components/ui/BackButton";
import { SettingsIconButton } from "@/components/ui/SettingsIconButton";
import { cn } from "@/lib/utils";

export interface FlowHeaderProps {
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export function FlowHeader({
  backHref,
  onBack,
  backLabel,
  title,
  rightAction,
  className,
}: FlowHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between px-4 bg-background border-b border-border/40",
        className
      )}
    >
      <BackButton
        href={backHref}
        onClick={onBack}
        label={backLabel}
        className="-ml-1"
      />
      {title && (
        <h1 className="text-base font-bold text-foreground truncate px-2">
          {title}
        </h1>
      )}
      <div className="flex items-center gap-2">
        {rightAction ?? <SettingsIconButton className="-mr-1" />}
      </div>
    </header>
  );
}
