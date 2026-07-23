import type {
  CalendarDate,
  CalendarEvent,
  CalendarSessionSummary,
} from "@/types/domains/calendar";

export type { CalendarDate } from "@/types/domains/calendar";
export type CalendarViewMode = "day" | "week" | "month";

export function toDate({ year, monthIndex, day }: CalendarDate) {
  return new Date(year, monthIndex, day);
}

export function fromDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    day: date.getDate(),
  };
}

export function isSameDay(a: CalendarDate, b: CalendarDate) {
  return (
    a.year === b.year && a.monthIndex === b.monthIndex && a.day === b.day
  );
}

export function isToday(date: CalendarDate, today: CalendarDate) {
  return isSameDay(date, today);
}

export function addDays(date: CalendarDate, count: number): CalendarDate {
  const next = toDate(date);
  next.setDate(next.getDate() + count);
  return fromDate(next);
}

export function addMonths(date: CalendarDate, count: number): CalendarDate {
  const next = toDate(date);
  next.setMonth(next.getMonth() + count);
  return fromDate(next);
}

export function getWeekStart(date: CalendarDate): CalendarDate {
  const weekday = (toDate(date).getDay() + 6) % 7;
  return addDays(date, -weekday);
}

export function getWeekDates(focusDate: CalendarDate): CalendarDate[] {
  const start = getWeekStart(focusDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function navigateCalendarDate(
  date: CalendarDate,
  view: CalendarViewMode,
  direction: -1 | 1,
): CalendarDate {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addDays(date, direction * 7);
  return addMonths(date, direction);
}

export function formatPeriodLabel(date: CalendarDate, view: CalendarViewMode) {
  if (view === "day") {
    return toDate(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (view === "week") {
    const weekDates = getWeekDates(date);
    const start = weekDates[0];
    const end = weekDates[6];
    const startLabel = toDate(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = toDate(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }

  return toDate(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getEventsForDate(
  date: CalendarDate,
  month: { monthIndex: number; year: number },
  events: CalendarEvent[],
): CalendarEvent[] {
  if (date.year !== month.year || date.monthIndex !== month.monthIndex) {
    return [];
  }

  return events.filter((event) => event.day === date.day);
}

export function isBlockedDate(
  date: CalendarDate,
  month: { monthIndex: number; year: number },
  blockedDays: number[],
) {
  if (date.year !== month.year || date.monthIndex !== month.monthIndex) {
    return false;
  }

  return blockedDays.includes(date.day);
}

export function isManuallyBlockedDate(
  date: CalendarDate,
  month: { monthIndex: number; year: number },
  manualBlockedDays: number[],
) {
  if (date.year !== month.year || date.monthIndex !== month.monthIndex) {
    return false;
  }

  return manualBlockedDays.includes(date.day);
}

export function getSessionsForDate(
  date: CalendarDate,
  sessions: CalendarSessionSummary[],
) {
  return sessions.filter(
    (session) =>
      session.year === date.year &&
      session.monthIndex === date.monthIndex &&
      session.day === date.day,
  );
}
