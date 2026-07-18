import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { PortalBreadcrumbs } from "@/components/common/PortalBreadcrumbs";
import { Button } from "@/components/ui/button";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import { ROUTES } from "@/constants/routes";
import type { BookingDetail } from "@/types/domains/booking";

type ClientBookingDetailHeaderProps = {
  detail: BookingDetail;
};

export function ClientBookingDetailHeader({
  detail,
}: ClientBookingDetailHeaderProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;
  const primaryAction = detail.primaryAction;

  return (
    <>
      <PortalBreadcrumbs
        items={[
          { label: copy.backToBookings, href: ROUTES.client.bookings },
          { label: detail.sessionLabel },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
            {detail.sessionLabel}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-muted-light" aria-hidden />
              {detail.event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-muted-light" aria-hidden />
              {detail.event.city}
            </span>
          </div>
          {detail.statusMessage ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {detail.statusMessage}
            </p>
          ) : null}
        </div>

        {primaryAction?.type === "link" ? (
          <Button
            variant="gold"
            className="h-auto shrink-0 px-5 py-3 shadow-card"
            asChild
          >
            <Link to={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        ) : null}
      </div>
    </>
  );
}
