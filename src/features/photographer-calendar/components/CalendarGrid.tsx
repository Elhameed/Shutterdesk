import { CALENDAR_COPY, CALENDAR_WEEKDAYS } from "@/constants/photographer-calendar";
import { CalendarEventList } from "@/features/photographer-calendar/components/CalendarEventList";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import {
  getEventsForDate,
  isBlockedDate,
  isManuallyBlockedDate,
  isSameDay,
  isToday,
  type CalendarDate,
} from "@/features/photographer-calendar/lib/calendar-navigation";
import { getMonthCalendarDays } from "@/features/photographer-calendar/lib/calendar-days";
import { cn } from "@/lib/utils";

type CalendarGridProps = {
  focusDate: CalendarDate;
  onSelectDay: (date: CalendarDate) => void;
};

export function CalendarGrid({ focusDate, onSelectDay }: CalendarGridProps) {
  const copy = CALENDAR_COPY;
  const calendarData = useCalendarData();
  const days = getMonthCalendarDays(focusDate.year, focusDate.monthIndex);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="grid grid-cols-7 border-b border-border bg-gray-50">
        {CALENDAR_WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2.5 text-center text-[10px] font-semibold tracking-wider text-muted-light sm:px-3"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const isCurrent = day.month === "current";
          const cellDate: CalendarDate = {
            year: focusDate.year,
            monthIndex:
              day.month === "prev"
                ? focusDate.monthIndex - 1
                : day.month === "next"
                  ? focusDate.monthIndex + 1
                  : focusDate.monthIndex,
            day: day.date,
          };
          const normalizedDate =
            cellDate.monthIndex < 0
              ? { ...cellDate, year: cellDate.year - 1, monthIndex: 11 }
              : cellDate.monthIndex > 11
                ? { ...cellDate, year: cellDate.year + 1, monthIndex: 0 }
                : cellDate;

          const isSelected =
            isCurrent && isSameDay(normalizedDate, focusDate);
          const today = isCurrent && isToday(normalizedDate, calendarData.today);
          const blocked =
            isCurrent &&
            isBlockedDate(normalizedDate, calendarData.month, calendarData.blockedDays);
          const manuallyBlocked =
            isCurrent &&
            isManuallyBlockedDate(
              normalizedDate,
              calendarData.month,
              calendarData.manualBlockedDays,
            );
          const events = isCurrent
            ? getEventsForDate(normalizedDate, calendarData.month, calendarData.events)
            : [];

          return (
            <button
              key={day.key}
              type="button"
              disabled={!isCurrent}
              onClick={() => isCurrent && onSelectDay(normalizedDate)}
              className={cn(
                "min-h-[72px] border-r border-b border-border p-1.5 text-left transition-colors sm:min-h-[100px] sm:p-2",
                "last:border-r-0",
                !isCurrent && "bg-gray-50/50",
                isCurrent && "hover:bg-gray-50",
                isSelected && "bg-gold-light/60",
                manuallyBlocked && !isSelected && "bg-charcoal/5 ring-1 ring-inset ring-charcoal/10",
                blocked && !manuallyBlocked && !isSelected && "bg-gray-100",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center text-xs font-semibold sm:text-sm",
                  !isCurrent && "text-muted-light",
                  isCurrent && "text-charcoal",
                  today && "rounded-full bg-gold text-white",
                )}
              >
                {day.date}
              </span>

              {manuallyBlocked ? (
                <span className="mt-0.5 inline-block rounded px-1 py-0.5 text-[9px] font-bold tracking-wide text-charcoal/70 uppercase">
                  {copy.dayBlockedLabel}
                </span>
              ) : null}

              <div className="mt-1">
                <CalendarEventList events={events} compact />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
