import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { SearchField } from "@/components/common/SearchField";
import { Button } from "@/components/ui/button";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import { NextSessionBadge } from "@/features/client-bookings/components/NextSessionBadge";
import {
  BOOKING_STATUS_BADGE_STYLES,
  PAYMENT_BADGE_STYLES,
} from "@/constants/status-colors";
import { ROUTES } from "@/constants/routes";
import type { ClientBookingFilter } from "@/constants/client-bookings";
import { getQueryErrorMessage } from "@/lib/api-error";
import {
  useClientBookings,
} from "@/hooks/queries/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { TableRowsSkeleton } from "@/components/skeletons";
import type { Booking } from "@/types/domains/booking";
import { cn } from "@/lib/utils";

const filters: ClientBookingFilter[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
];

function getNextSessionDate(bookings: Booking[]) {
  const upcoming = bookings.find((booking) => booking.status === "confirmed");
  return upcoming?.date ?? null;
}

export function ClientBookingsView() {
  const copy = CLIENT_BOOKINGS_COPY;
  const [filter, setFilter] = useState<ClientBookingFilter>("all");
  const [search, setSearch] = useState("");
  const { data: allBookings = [], isLoading, error } = useClientBookings();
  const showSkeleton = useDelayedLoading(isLoading);

  const nextSessionDate = getNextSessionDate(allBookings);

  const filtered = useMemo(() => {
    let result = allBookings;
    if (filter !== "all") {
      result = result.filter((b) => b.status === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (b) =>
          b.packageName.toLowerCase().includes(q) ||
          b.date.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allBookings, filter, search]);

  const errorMessage = error
    ? getQueryErrorMessage(error, "Unable to load bookings.")
    : null;

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        breakpoint="lg"
        actions={
          nextSessionDate ? (
            <NextSessionBadge date={nextSessionDate} />
          ) : undefined
        }
      />

      <div className="mt-6">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={copy.searchPlaceholder}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              filter === key
                ? "bg-charcoal text-white"
                : "bg-white text-muted ring-1 ring-border hover:text-charcoal",
            )}
          >
            {copy.filters[key]}
          </button>
        ))}
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-4">
        {showSkeleton ? (
          <TableRowsSkeleton rows={5} />
        ) : isLoading ? null : (
          <ClientBookingsTable
            bookings={filtered}
            isFiltered={filter !== "all" || search.trim().length > 0}
          />
        )}
      </div>
    </div>
  );
}

function ClientBookingsTable({
  bookings,
  isFiltered,
}: {
  bookings: Booking[];
  isFiltered: boolean;
}) {
  const copy = CLIENT_BOOKINGS_COPY;
  const navigate = useNavigate();

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold text-charcoal">
          {isFiltered ? copy.noResults : copy.emptyTitle}
        </p>
        <p className="mt-2 text-sm text-muted">
          {isFiltered ? "Try a different search or filter." : copy.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-gray-50 text-[11px] font-semibold tracking-wider text-muted-light uppercase">
            <tr>
              <th className="px-4 py-3">{copy.columns.package}</th>
              <th className="px-4 py-3">{copy.columns.date}</th>
              <th className="px-4 py-3">{copy.columns.status}</th>
              <th className="px-4 py-3">{copy.columns.payment}</th>
              <th className="px-4 py-3">{copy.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-border last:border-0">
                <td className="px-4 py-4">
                  <p className="font-semibold text-charcoal">{booking.packageName}</p>
                  <p className="text-xs text-muted">{booking.packageDetail}</p>
                </td>
                <td className="px-4 py-4 text-muted">
                  {booking.date}
                  <br />
                  {booking.time}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      BOOKING_STATUS_BADGE_STYLES[booking.status],
                    )}
                  >
                    {copy.statusLabels[booking.status]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      PAYMENT_BADGE_STYLES[booking.payment],
                    )}
                  >
                    {copy.paymentLabels[booking.payment]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(ROUTES.client.bookingDetail(booking.id))
                    }
                  >
                    {copy.viewDetails}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
