import { createContext, useContext } from "react";
import type { CalendarMonthData } from "@/types/domains/calendar";

export const CalendarDataContext = createContext<CalendarMonthData | null>(null);

export function useCalendarData() {
  const value = useContext(CalendarDataContext);
  if (!value) {
    throw new Error("useCalendarData must be used within CalendarDataContext");
  }
  return value;
}
