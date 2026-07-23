export type CalendarDay = {
  date: number;
  month: "prev" | "current" | "next";
  key: string;
};

export function getMonthCalendarDays(year: number, monthIndex: number): CalendarDay[] {
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const date = daysInPrevMonth - i;
    days.push({
      date,
      month: "prev",
      key: `prev-${date}`,
    });
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    days.push({
      date,
      month: "current",
      key: `current-${date}`,
    });
  }

  let nextDate = 1;
  while (days.length % 7 !== 0) {
    days.push({
      date: nextDate,
      month: "next",
      key: `next-${nextDate}`,
    });
    nextDate += 1;
  }

  return days;
}
