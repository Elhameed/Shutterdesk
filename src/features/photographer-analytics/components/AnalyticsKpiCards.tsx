import type { ReactNode } from "react";
import { Banknote, Camera, TrendingUp, UserPlus } from "lucide-react";
import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { AnalyticsKpi } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";

const iconMap = {
  banknote: Banknote,
  camera: Camera,
  userPlus: UserPlus,
  trending: TrendingUp,
} as const;

export function AnalyticsKpiCards({ kpis }: { kpis: AnalyticsKpi[] }) {
  const copy = ANALYTICS_COPY.kpis;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];

        return (
          <article
            key={kpi.id}
            className="rounded-xl border border-border bg-white p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-gold-light text-gold">
                <Icon className="size-4" aria-hidden />
              </div>

              {"trend" in kpi && kpi.trend && (
                <TrendBadge up={kpi.trendUp}>{kpi.trend}</TrendBadge>
              )}
              {"subtext" in kpi && kpi.subtext && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {kpi.subtext}
                </span>
              )}
            </div>

            <p className="mt-4 text-[11px] font-semibold tracking-wider text-muted-light uppercase">
              {copy[kpi.labelKey]}
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-charcoal">
              {kpi.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function TrendBadge({
  children,
  up,
}: {
  children: ReactNode;
  up?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600",
      )}
    >
      {children}
      {up && <span aria-hidden>↗</span>}
    </span>
  );
}
