import { Clock, MapPin } from "lucide-react";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import type { BookingDetail } from "@/types/domains/booking";

type ClientSessionDetailsCardProps = {
  event: BookingDetail["event"];
};

export function ClientSessionDetailsCard({ event }: ClientSessionDetailsCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="text-base font-bold text-ink">{copy.sessionDetails}</h2>

      <dl className="mt-4 space-y-4">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-paper-dim text-ink-soft">
            <Clock className="size-4" aria-hidden />
          </span>
          <div>
            <dt className="text-[10px] font-medium text-ink-faint">
              {copy.dateTime}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {event.timeWindow}
            </dd>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-paper-dim text-ink-soft">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div>
            <dt className="text-[10px] font-medium text-ink-faint">
              {copy.venue}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {event.venue}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
