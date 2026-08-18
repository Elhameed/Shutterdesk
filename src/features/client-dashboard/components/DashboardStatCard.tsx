import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tag?: string;
  alert?: boolean;
};

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tag,
  alert = false,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            alert ? "bg-red-50 text-red-500" : "bg-gold-light text-gold",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
        {tag && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-charcoal">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
