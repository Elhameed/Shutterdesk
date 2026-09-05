import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PortalPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  breakpoint?: "sm" | "lg";
};

export function PortalPageHeader({
  title,
  subtitle,
  actions,
  className,
  breakpoint = "sm",
}: PortalPageHeaderProps) {
  const rowClass =
    breakpoint === "lg"
      ? "lg:flex-row lg:items-center lg:justify-between"
      : "sm:flex-row sm:items-center sm:justify-between";

  return (
    <div className={cn("flex flex-col gap-4", rowClass, className)}>
      <div>
        <h1 className="font-display text-ink text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-ink-soft mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
