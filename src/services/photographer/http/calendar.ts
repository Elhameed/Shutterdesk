import { apiClient } from "@/lib/api-client";
import type { CalendarMonthData } from "@/types/domains/calendar";

type Response = { data: CalendarMonthData };

export const photographerCalendarHttp = {
  async getMonth(month: number, year: number): Promise<CalendarMonthData> {
    const { data } = await apiClient.get<Response>("/photographer/calendar", {
      params: { month, year },
    });
    return data.data;
  },
};
