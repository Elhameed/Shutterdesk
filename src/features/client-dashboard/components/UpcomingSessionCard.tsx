import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingAssets } from "@/constants/assets";
import { CLIENT_DASHBOARD_COPY } from "@/constants/client-dashboard";
import { ROUTES } from "@/constants/routes";
import { CLIENT_SUPPORT_EMAIL } from "@/constants/support";

type UpcomingSessionCardProps = {
  title: string;
  date: string;
  venue: string;
  bookingId: string;
};

export function UpcomingSessionCard({
  title,
  date,
  venue,
  bookingId,
}: UpcomingSessionCardProps) {
  const copy = CLIENT_DASHBOARD_COPY;
  const cover = landingAssets.gallery.wedding[2];

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 sm:block">
        <img
          src={cover.src}
          alt={cover.alt}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
      </div>

      <div className="absolute inset-y-0 left-0 w-1 bg-gold" aria-hidden />

      <div className="relative max-w-md p-5 pl-6">
        <p className="text-[11px] font-semibold tracking-wider text-gold uppercase">
          {copy.upcomingSession}
        </p>
        <h2 className="mt-2 text-xl font-bold text-charcoal">{title}</h2>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-muted-light" aria-hidden />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-muted-light" aria-hidden />
            {venue}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.client.bookingDetail(bookingId)}>
              {copy.viewBooking}
            </Link>
          </Button>
          <a
            href={`mailto:${CLIENT_SUPPORT_EMAIL}?subject=Session%20inquiry`}
            className="text-xs font-semibold text-muted transition-colors hover:text-charcoal"
          >
            {copy.contactPhotographer} ›
          </a>
        </div>
      </div>
    </section>
  );
}
