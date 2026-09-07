import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";
import { formatRwf } from "@/lib/currency";

type InsightsCardProps = {
  insights: ClientProfileDetail["insights"];
};

export function InsightsCard({ insights }: InsightsCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  const rows = [
    { label: copy.retention, value: insights.retention },
    { label: copy.favType, value: insights.favType },
    { label: copy.avgValue, value: formatRwf(insights.avgValue) },
  ];

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="text-[10px] font-medium text-ink-faint">
        {copy.insights}
      </h2>

      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-ink-soft">{row.label}</dt>
            <dd className="font-bold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
