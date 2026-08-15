import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom";
};

export function Tooltip({
  label,
  children,
  className,
  side = "bottom",
}: TooltipProps) {
  return (
    <div className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {label}
      </span>
    </div>
  );
}
