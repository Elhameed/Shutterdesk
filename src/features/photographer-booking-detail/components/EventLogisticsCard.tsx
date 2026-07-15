import { Calendar, MapPin } from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import type { BookingDetail } from "@/types/domains/booking";

type EventLogisticsCardProps = {
  event: BookingDetail["event"];
};

export function EventLogisticsCard({ event }: EventLogisticsCardProps) {
  const copy = BOOKING_DETAIL_COPY;

  return (
    <section className="h-full rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal">{copy.eventLogistics}</h2>
        <Calendar className="size-4 shrink-0 text-muted" aria-hidden />
      </div>

      <div className="space-y-5">
        <div className="flex gap-3">
          <Calendar className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.dateTime}
            </p>
            <p className="mt-1 text-sm font-bold text-charcoal">{event.date}</p>
            <p className="text-xs text-muted">{event.timeWindow}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.location}
            </p>
            <p className="mt-1 text-sm font-bold text-charcoal">{event.venue}</p>
            <p className="text-xs text-muted">{event.city}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
