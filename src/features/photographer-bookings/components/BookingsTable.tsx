import { useNavigate } from "react-router-dom";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";
import {
  BOOKING_STATUS_BADGE_STYLES,
  PAYMENT_BADGE_STYLES,
} from "@/constants/status-colors";
import { ROUTES } from "@/constants/routes";
import { BookingActions } from "@/features/photographer-bookings/components/BookingActions";
import { BookingsPagination } from "@/features/photographer-bookings/components/BookingsPagination";
import type { Booking } from "@/types/domains/booking";
import { cn } from "@/lib/utils";

type BookingsTableProps = {
  bookings: Booking[];
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  totalBookings: number;
  onPageChange: (page: number) => void;
  onActionError?: (message: string) => void;
};

function PaymentBadge({ payment }: { payment: Booking["payment"] }) {
  const copy = BOOKINGS_COPY.payment;

  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        PAYMENT_BADGE_STYLES[payment],
      )}
    >
      {copy[payment]}
    </span>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const copy = BOOKINGS_COPY.status;

  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        BOOKING_STATUS_BADGE_STYLES[status],
      )}
    >
      {copy[status]}
    </span>
  );
}

function ClientCell({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={booking.avatar}
        alt={booking.clientName}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-charcoal">{booking.clientName}</p>
        <p className="truncate text-xs text-muted">{booking.email}</p>
      </div>
    </div>
  );
}

export function BookingsTable({
  bookings,
  currentPage,
  totalPages,
  from,
  to,
  totalBookings,
  onPageChange,
  onActionError,
}: BookingsTableProps) {
  const copy = BOOKINGS_COPY;
  const navigate = useNavigate();

  const openBooking = (bookingId: string) => {
    navigate(ROUTES.photographer.bookingDetail(bookingId));
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        No bookings found for this filter.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <button
              type="button"
              onClick={() => openBooking(booking.id)}
              className="w-full p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <ClientCell booking={booking} />
                <BookingActions
                  bookingId={booking.id}
                  actions={booking.actions}
                  onActionError={onActionError}
                />
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {booking.packageName}
                  </p>
                  <p className="text-xs text-muted">{booking.packageDetail}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-charcoal">
                    {booking.date} • {booking.time}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PaymentBadge payment={booking.payment} />
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.client}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.servicePackage}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.dateTime}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.payment}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.status}
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
              >
                <td
                  className="px-5 py-4 align-top"
                  onClick={() => openBooking(booking.id)}
                >
                  <ClientCell booking={booking} />
                </td>
                <td
                  className="px-5 py-4 align-top"
                  onClick={() => openBooking(booking.id)}
                >
                  <p className="text-sm font-semibold text-charcoal">
                    {booking.packageName}
                  </p>
                  <p className="text-xs text-muted">{booking.packageDetail}</p>
                </td>
                <td
                  className="px-5 py-4 align-top"
                  onClick={() => openBooking(booking.id)}
                >
                  <p className="text-sm font-semibold text-charcoal">
                    {booking.date}
                  </p>
                  <p className="text-xs text-muted">{booking.time}</p>
                </td>
                <td
                  className="px-5 py-4 align-top"
                  onClick={() => openBooking(booking.id)}
                >
                  <PaymentBadge payment={booking.payment} />
                </td>
                <td
                  className="px-5 py-4 align-top"
                  onClick={() => openBooking(booking.id)}
                >
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-5 py-4 align-top">
                  <BookingActions
                    bookingId={booking.id}
                    actions={booking.actions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BookingsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        from={from}
        to={to}
        totalBookings={totalBookings}
        onPageChange={onPageChange}
      />
    </div>
  );
}
