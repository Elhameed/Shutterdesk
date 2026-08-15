import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";

export function AvailabilityOverview() {
  const copy = CALENDAR_COPY;
  const { availability } = useCalendarData();

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
            {copy.availabilityOverview}
          </p>
          <p className="mt-1 text-lg font-bold text-charcoal">
            {availability.percent}%
          </p>
          <p className="text-xs text-muted">{availability.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">
            {copy.slotsRemaining(availability.slotsRemaining, availability.month)}
          </p>
        </div>
      </div>
    </section>
  );
}
