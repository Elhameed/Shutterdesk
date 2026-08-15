import { ClientManagementActions } from "@/features/photographer-clients/components/ClientManagementActions";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { CLIENT_TIER_BADGE_STYLES } from "@/constants/status-colors";
import { formatClientCurrency } from "@/features/photographer-clients/lib/client-utils";
import type { Client } from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

const categoryStyles = {
  wedding: "bg-gold-light text-gold",
  commercial: "bg-gray-100 text-charcoal",
  portrait: "bg-gray-100 text-charcoal",
  editorial: "bg-gray-100 text-charcoal",
} as const;

type ClientsListProps = {
  clients: Client[];
};

function CategoryBadge({ category }: { category: Client["category"] }) {
  const copy = CLIENTS_COPY;

  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        categoryStyles[category],
      )}
    >
      {copy.categories[category]}
    </span>
  );
}

function TierBadge({ tier }: { tier: Client["tier"] }) {
  const copy = CLIENTS_COPY;

  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        CLIENT_TIER_BADGE_STYLES[tier],
      )}
    >
      {copy.status[tier]}
    </span>
  );
}

function HealthIndicator({ balance }: { balance: number }) {
  const copy = CLIENTS_COPY;
  const atRisk = balance > 0;

  return (
    <span className="inline-flex items-center gap-2 text-sm text-charcoal">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          atRisk ? "bg-red-500" : "bg-green-500",
        )}
        aria-hidden
      />
      {atRisk ? copy.atRisk : copy.healthy}
    </span>
  );
}

function ClientCell({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={client.avatar}
        alt={client.name}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal">{client.name}</p>
        <p className="truncate text-xs text-muted">{client.email}</p>
      </div>
    </div>
  );
}

function ClientActions({ client }: { client: Client }) {
  return <ClientManagementActions client={client} variant="list" />;
}

export function ClientsList({ clients }: ClientsListProps) {
  const copy = CLIENTS_COPY;

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        No clients found for this filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* Mobile cards */}
      <ul className="divide-y divide-border lg:hidden">
        {clients.map((client) => (
          <li key={client.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <ClientCell client={client} />
              <ClientActions client={client} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={client.category} />
              <TierBadge tier={client.tier} />
            </div>

            <div className="mt-2">
              <HealthIndicator balance={client.balance} />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-light">{copy.sessions}</dt>
                <dd className="font-semibold text-charcoal">{client.sessions}</dd>
              </div>
              <div>
                <dt className="text-muted-light">{copy.totalRevenue}</dt>
                <dd className="font-bold text-charcoal">
                  {formatClientCurrency(client.revenue)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-light">{copy.balance}</dt>
                <dd
                  className={cn(
                    "font-bold",
                    client.balance > 0 ? "text-red-600" : "text-charcoal",
                  )}
                >
                  {formatClientCurrency(client.balance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-light">{copy.lastBooking}</dt>
                <dd className="text-charcoal">{client.lastBooking}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1000px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.client}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.category}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.sessions}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.totalRevenue}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.balance}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.lastBooking}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.status}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.health}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-gray-50">
                <td className="px-5 py-4 align-top">
                  <ClientCell client={client} />
                </td>
                <td className="px-5 py-4 align-top">
                  <CategoryBadge category={client.category} />
                </td>
                <td className="px-5 py-4 align-top text-sm text-charcoal">
                  {client.sessions}
                </td>
                <td className="px-5 py-4 align-top text-sm font-bold text-charcoal">
                  {formatClientCurrency(client.revenue)}
                </td>
                <td
                  className={cn(
                    "px-5 py-4 align-top text-sm font-bold",
                    client.balance > 0 ? "text-red-600" : "text-charcoal",
                  )}
                >
                  {formatClientCurrency(client.balance)}
                </td>
                <td className="px-5 py-4 align-top text-sm text-charcoal">
                  {client.lastBooking}
                </td>
                <td className="px-5 py-4 align-top">
                  <TierBadge tier={client.tier} />
                </td>
                <td className="px-5 py-4 align-top">
                  <HealthIndicator balance={client.balance} />
                </td>
                <td className="px-5 py-4 align-top">
                  <ClientActions client={client} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
