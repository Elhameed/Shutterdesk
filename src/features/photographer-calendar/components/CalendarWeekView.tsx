import { CALENDAR_COPY, CALENDAR_WEEKDAYS } from "@/constants/photographer-calendar";
import { CalendarEventList } from "@/features/photographer-calendar/components/CalendarEventList";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import {
  getEventsForDate,
  getWeekDates,
  isBlockedDate,
  isManuallyBlockedDate,
  isSameDay,
  isToday,
  toDate,
  type CalendarDate,
} from "@/features/photographer-calendar/lib/calendar-navigation";
import { cn } from "@/lib/utils";

type CalendarWeekViewProps = {
  focusDate: CalendarDate;
  onSelectDay: (date: CalendarDate) => void;
};

export function CalendarWeekView({
  focusDate,
  onSelectDay,
}: CalendarWeekViewProps) {
  const copy = CALENDAR_COPY;
  const calendarData = useCalendarData();
  const weekDates = getWeekDates(focusDate);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="grid grid-cols-7 border-b border-border bg-gray-50">
        {CALENDAR_WEEKDAYS.map((label, index) => {
          const date = weekDates[index];

          return (
            <div
              key={label}
              className="border-r border-border px-2 py-2.5 text-center last:border-r-0 sm:px-3"
            >
              <p className="text-[10px] font-semibold tracking-wider text-muted-light">
                {label}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  isToday(date, calendarData.today) ? "text-gold" : "text-charcoal",
                )}
              >
                {toDate(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {weekDates.map((date) => {
          const events = getEventsForDate(
            date,
            calendarData.month,
            calendarData.events,
          );
          const selected = isSameDay(date, focusDate);
          const blocked = isBlockedDate(
            date,
            calendarData.month,
            calendarData.blockedDays,
          );
          const manuallyBlocked = isManuallyBlockedDate(
            date,
            calendarData.month,
            calendarData.manualBlockedDays,
          );

          return (
            <button
              key={`${date.year}-${date.monthIndex}-${date.day}`}
              type="button"
              onClick={() => onSelectDay(date)}
              className={cn(
                "min-h-[160px] border-r border-b border-border p-2 text-left transition-colors last:border-r-0 sm:min-h-[200px] sm:p-3",
                "hover:bg-gray-50",
                selected && "bg-gold-light/60",
                manuallyBlocked && !selected && "bg-charcoal/5 ring-1 ring-inset ring-charcoal/10",
                blocked && !manuallyBlocked && !selected && "bg-gray-100",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center text-xs font-semibold sm:text-sm",
                  isToday(date, calendarData.today) && "rounded-full bg-gold text-white",
                  !isToday(date, calendarData.today) && "text-charcoal",
                )}
              >
                {date.day}
              </span>
              {manuallyBlocked ? (
                <span className="mt-1 inline-block rounded px-1 py-0.5 text-[9px] font-bold tracking-wide text-charcoal/70 uppercase">
                  {copy.dayBlockedLabel}
                </span>
              ) : null}
              <div className="mt-2">
                <CalendarEventList events={events} compact />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
