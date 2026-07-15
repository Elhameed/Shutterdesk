import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { BOOKING_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import { ROUTES } from "@/constants/routes";
import {
  resolveBookingDetailHeaderActions,
  type BookingDetailHeaderAction,
} from "@/features/photographer-booking-detail/utils/booking-detail-actions";
import type { BookingDetail } from "@/types/domains/booking";
import { cn } from "@/lib/utils";

type BookingDetailHeaderProps = {
  booking: BookingDetail;
  isUpdating?: boolean;
  onReject?: () => void;
  onMarkComplete?: () => void;
};

function HeaderActionButton({
  action,
  isUpdating,
  onReject,
  onMarkComplete,
}: {
  action: BookingDetailHeaderAction;
  isUpdating?: boolean;
  onReject?: () => void;
  onMarkComplete?: () => void;
}) {
  if (action.kind === "link") {
    return (
      <Button variant={action.variant} size="sm" asChild>
        <Link to={action.href}>{action.label}</Link>
      </Button>
    );
  }

  if (action.kind === "reject") {
    return (
      <Button
        variant={action.variant}
        size="sm"
        disabled={isUpdating}
        onClick={onReject}
      >
        {action.label}
      </Button>
    );
  }

  return (
    <Button
      variant={action.variant}
      size="sm"
      disabled={isUpdating}
      onClick={onMarkComplete}
    >
      {action.label}
    </Button>
  );
}

export function BookingDetailHeader({
  booking,
  isUpdating = false,
  onReject,
  onMarkComplete,
}: BookingDetailHeaderProps) {
  const copy = BOOKING_DETAIL_COPY;
  const actions = resolveBookingDetailHeaderActions(booking);

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted"
      >
        <Link
          to={ROUTES.photographer.bookings}
          className="transition-colors hover:text-charcoal"
        >
          {copy.breadcrumbBookings}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="font-medium text-charcoal">{booking.reference}</span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
              {booking.reference}
            </h1>
            <span
              className={cn(
                "inline-flex rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                BOOKING_STATUS_BADGE_STYLES[booking.detailStatus],
              )}
            >
              {copy.status[booking.detailStatus]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {copy.requestedOn(booking.requestedDate, booking.sessionLabel)}
          </p>
          {booking.statusMessage ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {booking.statusMessage}
            </p>
          ) : null}
        </div>

        {actions.length > 0 ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {actions.map((action) => (
              <HeaderActionButton
                key={`${action.kind}-${action.label}`}
                action={action}
                isUpdating={isUpdating}
                onReject={onReject}
                onMarkComplete={onMarkComplete}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
