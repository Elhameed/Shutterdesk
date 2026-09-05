import type { LucideIcon } from "lucide-react";
import { FrameCell } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tag?: string;
  alert?: boolean;
};

/**
 * A single cell in the client dashboard stat frame — render inside a
 * `FrameGrid`, matching the photographer dashboard and analytics KPIs so all
 * three stat surfaces read as one component.
 *
 * `icon` stays in the props so callers are unchanged, but like the other two
 * frames it isn't drawn: a tinted chip in every cell is decorative weight
 * competing with the number, which is the actual signal. The alert state moves
 * onto the value itself, where it reads faster.
 */
export function DashboardStatCard({
  label,
  value,
  tag,
  alert = false,
}: DashboardStatCardProps) {
  return (
    <FrameCell className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-ink-soft text-xs">{label}</p>
        {tag && (
          <span className="text-ink-faint shrink-0 text-[11px]">{tag}</span>
        )}
      </div>

      <p
        className={cn(
          "font-display mt-2 text-2xl",
          alert ? "text-bad-fg" : "text-ink",
        )}
      >
        {value}
      </p>
    </FrameCell>
  );
}
