"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  href?: string;
  trailing?: React.ReactNode;
  className?: string;
}

/** One row inside a settings list group -- icon, label(+description), trailing control or chevron. */
export function SettingsRow({ icon: Icon, label, description, href, trailing, className }: SettingsRowProps) {
  const content = (
    <div className={cn("flex min-h-[60px] items-center gap-3 px-4 py-3", className)}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[--radius-sm] bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-1 min-w-0 flex-col">
        <span className="text-base font-semibold text-foreground">{label}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      {trailing ?? (href && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />)}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block outline-none transition-colors hover:bg-accent/30 focus-visible:bg-accent/60"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/** Rounded card container holding a group of SettingsRows, divided by hairlines. */
export function SettingsGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[--radius-md] bg-card shadow-xs divide-y divide-border",
        className
      )}
    >
      {children}
    </div>
  );
}
