import type { ReactNode } from "react";

interface SkipLinkProps {
  targetId: string;
  children: ReactNode;
}

export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-foreground focus:outline-2 focus:outline-ring focus:outline-offset-2"
    >
      {children}
    </a>
  );
}
