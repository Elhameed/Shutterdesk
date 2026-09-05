import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BrowserFrameProps = {
  children: ReactNode;
  className?: string;
};

export function BrowserFrame({ children, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "border-border bg-panel overflow-hidden rounded-md border",
        className,
      )}
    >
      {/* Muted window dots — three saturated traffic-light colors were the
          loudest thing on the page, competing with the screenshot inside. */}
      <div className="border-border bg-paper-dim flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-border-strong size-2.5 rounded-full" />
        <span className="bg-border-strong size-2.5 rounded-full" />
        <span className="bg-border-strong size-2.5 rounded-full" />
      </div>
      <div className="bg-rail-bg">{children}</div>
    </div>
  );
}
