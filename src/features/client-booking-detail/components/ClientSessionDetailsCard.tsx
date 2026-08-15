import { Clock, MapPin } from "lucide-react";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import type { BookingDetail } from "@/types/domains/booking";

type ClientSessionDetailsCardProps = {
  event: BookingDetail["event"];
};

export function ClientSessionDetailsCard({ event }: ClientSessionDetailsCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-base font-bold text-charcoal">{copy.sessionDetails}</h2>

      <dl className="mt-4 space-y-4">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted">
            <Clock className="size-4" aria-hidden />
          </span>
          <div>
            <dt className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.dateTime}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-charcoal">
              {event.timeWindow}
            </dd>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div>
            <dt className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.venue}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-charcoal">
              {event.venue}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
