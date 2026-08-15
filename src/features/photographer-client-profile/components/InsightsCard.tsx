import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";
import { formatClientCurrency } from "@/features/photographer-clients/lib/client-utils";

type InsightsCardProps = {
  insights: ClientProfileDetail["insights"];
};

export function InsightsCard({ insights }: InsightsCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  const rows = [
    { label: copy.retention, value: insights.retention },
    { label: copy.favType, value: insights.favType },
    { label: copy.avgValue, value: formatClientCurrency(insights.avgValue) },
  ];

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
        {copy.insights}
      </h2>

      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-bold text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
