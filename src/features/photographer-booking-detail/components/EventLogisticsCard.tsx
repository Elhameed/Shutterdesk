import { Calendar, MapPin } from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import type { BookingDetail } from "@/types/domains/booking";

type EventLogisticsCardProps = {
  event: BookingDetail["event"];
};

export function EventLogisticsCard({ event }: EventLogisticsCardProps) {
  const copy = BOOKING_DETAIL_COPY;

  return (
    <section className="h-full rounded-md border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-ink">{copy.eventLogistics}</h2>
        <Calendar className="size-4 shrink-0 text-ink-soft" aria-hidden />
      </div>

      <div className="space-y-5">
        <div className="flex gap-3">
          <Calendar className="mt-0.5 size-4 shrink-0 text-ink-soft" aria-hidden />
          <div>
            <p className="text-[10px] font-medium text-ink-faint">
              {copy.dateTime}
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{event.date}</p>
            <p className="text-xs text-ink-soft">{event.timeWindow}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-soft" aria-hidden />
          <div>
            <p className="text-[10px] font-medium text-ink-faint">
              {copy.location}
            </p>
            <p className="mt-1 text-sm font-bold text-ink">{event.venue}</p>
            <p className="text-xs text-ink-soft">{event.city}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
