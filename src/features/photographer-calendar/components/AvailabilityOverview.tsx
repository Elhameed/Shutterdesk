import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";

export function AvailabilityOverview() {
  const copy = CALENDAR_COPY;
  const { availability } = useCalendarData();

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.availabilityOverview}
          </p>
          <p className="mt-1 text-lg font-bold text-ink">
            {availability.percent}%
          </p>
          <p className="text-xs text-ink-soft">{availability.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft">
            {copy.slotsRemaining(availability.slotsRemaining, availability.month)}
          </p>
        </div>
      </div>
    </section>
  );
}
