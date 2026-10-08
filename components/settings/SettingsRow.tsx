"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  htmlFor?: string;
  trailing?: React.ReactNode;
  className?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

/** One row inside a settings list group -- optional icon, label(+description), trailing control or chevron. */
export function SettingsRow({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  htmlFor,
  trailing,
  className,
  iconBgClass = "bg-primary/10",
  iconColorClass = "text-primary",
}: SettingsRowProps) {
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]",
              iconBgClass,
              iconColorClass
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-1 min-w-0 flex-col justify-center gap-0.5">
          <span className="text-base font-bold text-foreground">{label}</span>
          {description && (
            <span className="text-base font-medium text-muted-foreground leading-relaxed">{description}</span>
          )}
        </div>
      </div>
      {trailing ? (
        <div className="shrink-0 flex items-center justify-center self-center">{trailing}</div>
      ) : (
        href && <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/50",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  if (htmlFor || onClick) {
    return (
      <label
        htmlFor={htmlFor}
        onClick={onClick}
        className={cn(
          "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50",
          className
        )}
      >
        {content}
      </label>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 select-none",
        className
      )}
    >
      {content}
    </div>
  );
}
