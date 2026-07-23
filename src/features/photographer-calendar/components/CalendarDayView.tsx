import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { CalendarEventList } from "@/features/photographer-calendar/components/CalendarEventList";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import {
  formatPeriodLabel,
  getEventsForDate,
  type CalendarDate,
} from "@/features/photographer-calendar/lib/calendar-navigation";

type CalendarDayViewProps = {
  focusDate: CalendarDate;
};

export function CalendarDayView({ focusDate }: CalendarDayViewProps) {
  const copy = CALENDAR_COPY;
  const calendarData = useCalendarData();
  const events = getEventsForDate(
    focusDate,
    calendarData.month,
    calendarData.events,
  );
  const heading = formatPeriodLabel(focusDate, "day");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-bold text-charcoal">{heading}</h2>
        <p className="mt-1 text-sm text-muted">{copy.dayViewHint}</p>
      </div>

      <div className="p-5">
        {events.length === 0 ? (
          <p className="text-sm text-muted">{copy.noSessionsDay}</p>
        ) : (
          <CalendarEventList events={events} />
        )}
      </div>
    </div>
  );
}
