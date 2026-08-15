import { MapPin, MoreVertical } from "lucide-react";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { SESSION_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import type { UpcomingShoot } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

const statusStyles = {
  confirmed: SESSION_STATUS_BADGE_STYLES.confirmed,
  paid: SESSION_STATUS_BADGE_STYLES.paid,
} as const;

type UpcomingShootsTableProps = {
  showHeader?: boolean;
  shoots: UpcomingShoot[];
};

function StatusBadge({
  status,
  confirmedLabel,
  paidLabel,
}: {
  status: "confirmed" | "paid";
  confirmedLabel: string;
  paidLabel: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase",
        statusStyles[status],
      )}
    >
      {status === "confirmed" ? confirmedLabel : paidLabel}
    </span>
  );
}

export function UpcomingShootsTable({
  showHeader = true,
  shoots,
}: UpcomingShootsTableProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.upcomingShoots;

  return (
    <section className="min-w-0">
      {showHeader && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-charcoal">{copy.title}</h2>
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
          >
            {copy.viewCalendar}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {/* Mobile: stacked cards — no horizontal scroll */}
        <ul className="divide-y divide-border sm:hidden">
          {shoots.map((shoot) => (
            <li key={shoot.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={shoot.avatar}
                    alt={shoot.clientName}
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-charcoal">
                      {shoot.clientName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {shoot.shootType}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <StatusBadge
                    status={shoot.status}
                    confirmedLabel={copy.statusConfirmed}
                    paidLabel={copy.statusPaid}
                  />
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
                    aria-label={`Actions for ${shoot.clientName}`}
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-charcoal">
                  {shoot.date}
                </p>
                <p className="text-xs text-muted">{shoot.time}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{shoot.location}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop: aligned table */}
        <div className="hidden sm:block">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[38%]" />
              <col className="w-[34%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="border-b border-border bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {copy.columns.client}
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {copy.columns.dateLocation}
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {copy.columns.status}
                </th>
                <th className="px-3 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shoots.map((shoot) => (
                <tr key={shoot.id}>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <img
                        src={shoot.avatar}
                        alt={shoot.clientName}
                        className="size-10 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal">
                          {shoot.clientName}
                        </p>
                        <p className="text-xs text-muted">{shoot.shootType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm font-semibold text-charcoal">
                      {shoot.date}
                    </p>
                    <p className="text-xs text-muted">{shoot.time}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      {shoot.location}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge
                      status={shoot.status}
                      confirmedLabel={copy.statusConfirmed}
                      paidLabel={copy.statusPaid}
                    />
                  </td>
                  <td className="px-3 py-4 align-top">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
                      aria-label={`Actions for ${shoot.clientName}`}
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
