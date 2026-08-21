import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import { formatRwf } from "@/lib/currency";
import type { TopClientStat } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";

const statusStyles = {
  highValue: "bg-green-50 text-green-700",
  goldStatus: "bg-green-50 text-green-700",
  loyalMember: "bg-gray-100 text-muted",
} as const;

export function TopClientsCard({ clients }: { clients: TopClientStat[] }) {
  const copy = ANALYTICS_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-sm font-bold text-charcoal">{copy.topClients}</h2>

      <ul className="mt-4 divide-y divide-border">
        {clients.map((client) => (
          <li
            key={client.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-light text-xs font-bold text-gold">
                {client.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {client.name}
                </p>
                <p className="text-xs text-muted">
                  {copy.sessions(client.sessions)}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-charcoal">
                {formatRwf(client.spent)}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  statusStyles[client.status],
                )}
              >
                {copy.clientStatus[client.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
