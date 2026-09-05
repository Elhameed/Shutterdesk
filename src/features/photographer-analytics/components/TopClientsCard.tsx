import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import { formatRwf } from "@/lib/currency";
import type { TopClientStat } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";

const statusStyles = {
  highValue: "bg-ok-tint text-ok-fg",
  goldStatus: "bg-ok-tint text-ok-fg",
  loyalMember: "bg-paper-dim text-ink-soft",
} as const;

export function TopClientsCard({ clients }: { clients: TopClientStat[] }) {
  const copy = ANALYTICS_COPY;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="text-sm font-bold text-ink">{copy.topClients}</h2>

      <ul className="mt-4 divide-y divide-border">
        {clients.map((client) => (
          <li
            key={client.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-bold text-accent">
                {client.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {client.name}
                </p>
                <p className="text-xs text-ink-soft">
                  {copy.sessions(client.sessions)}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-ink">
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
