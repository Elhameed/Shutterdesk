import { useState } from "react";
import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { PhotographerAnalyticsSummary } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";

type ChartPeriod = "monthly" | "weekly";

const CHART = {
  height: 180,
  bottomPadding: 28,
  slotWidth: 72,
  barWidth: 28,
} as const;

type RevenueChartCardProps = {
  analytics: PhotographerAnalyticsSummary;
};

export function RevenueChartCard({ analytics }: RevenueChartCardProps) {
  const copy = ANALYTICS_COPY;
  const [period, setPeriod] = useState<ChartPeriod>("monthly");

  const data =
    period === "monthly"
      ? analytics.revenueMonthlyData
      : analytics.revenueWeeklyData;

  const maxValue = Math.max(...data.flatMap((point) => [point.bar, point.line]), 1);

  const chartWidth = data.length * CHART.slotWidth;
  const plotHeight = CHART.height - CHART.bottomPadding;

  const points = data.map((point, index) => {
    const centerX = index * CHART.slotWidth + CHART.slotWidth / 2;
    const barHeight = (point.bar / maxValue) * plotHeight;
    const lineY =
      CHART.height -
      CHART.bottomPadding -
      (point.line / maxValue) * plotHeight;
    const barY = CHART.height - CHART.bottomPadding - barHeight;

    return {
      ...point,
      centerX,
      barX: centerX - CHART.barWidth / 2,
      barY,
      barHeight,
      lineY,
    };
  });

  const linePath = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.centerX} ${point.lineY}`;
    })
    .join(" ");

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal">{copy.revenueOverTime}</h2>

        <div className="flex rounded-lg border border-border bg-gray-100 p-1">
          {(["monthly", "weekly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                period === option
                  ? "bg-charcoal text-white"
                  : "text-muted hover:text-charcoal",
              )}
            >
              {copy[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART.height}`}
          className="mx-auto h-48 w-full min-w-[280px]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <line
            x1={0}
            y1={CHART.height - CHART.bottomPadding}
            x2={chartWidth}
            y2={CHART.height - CHART.bottomPadding}
            className="stroke-gray-200"
            strokeWidth={1}
          />

          {points.map((point) => (
            <g key={point.label}>
              <rect
                x={point.barX}
                y={point.barY}
                width={CHART.barWidth}
                height={point.barHeight}
                rx={4}
                className="fill-gray-200"
              />

              <text
                x={point.centerX}
                y={CHART.height - 8}
                textAnchor="middle"
                fill="#737373"
                fontSize={11}
                fontWeight={500}
              >
                {point.label}
              </text>
            </g>
          ))}

          <path
            d={linePath}
            fill="none"
            className="stroke-charcoal"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <circle
              key={`${point.label}-dot`}
              cx={point.centerX}
              cy={point.lineY}
              r={4}
              className="fill-charcoal"
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
