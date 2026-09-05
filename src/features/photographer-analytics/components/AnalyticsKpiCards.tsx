import type { ReactNode } from "react";
import { FrameCell, FrameGrid } from "@/components/ui/card";
import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { AnalyticsKpi } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";

/**
 * The analytics twin of the dashboard stat frame — same treatment, so the two
 * screens read as one system: a single bordered frame with 1px dividers, the
 * number in the display face, and no per-cell icon chip competing with it.
 */
export function AnalyticsKpiCards({ kpis }: { kpis: AnalyticsKpi[] }) {
  const copy = ANALYTICS_COPY.kpis;

  return (
    <FrameGrid className="sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <FrameCell key={kpi.id} className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-ink-soft text-xs">{copy[kpi.labelKey]}</p>

            {"trend" in kpi && kpi.trend && (
              <TrendBadge up={kpi.trendUp}>{kpi.trend}</TrendBadge>
            )}
          </div>

          <p className="font-display text-ink mt-2 text-2xl">{kpi.value}</p>

          {"subtext" in kpi && kpi.subtext && (
            <p className="text-ink-faint mt-1 text-[11px]">{kpi.subtext}</p>
          )}
        </FrameCell>
      ))}
    </FrameGrid>
  );
}

function TrendBadge({ children, up }: { children: ReactNode; up?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 text-[11px] font-medium",
        up ? "text-ok-fg" : "text-bad-fg",
      )}
    >
      {children}
      {up && <span aria-hidden> ↗</span>}
    </span>
  );
}
