export type CalendarEventVariant =
  | "editorial"
  | "travel"
  | "wedding"
  | "product"
  | "confirmed"
  | "awaitingPayment"
  | "paid";

export type CalendarEvent = {
  id: string;
  day: number;
  label: string;
  variant: CalendarEventVariant;
};

export type CalendarDate = {
  year: number;
  monthIndex: number;
  day: number;
};

export type CalendarMonthData = {
  month: {
    label: string;
    monthIndex: number;
    year: number;
  };
  events: CalendarEvent[];
  blockedDays: number[];
  manualBlockedDays: number[];
  today: CalendarDate;
  availability: {
    percent: number;
    label: string;
    slotsRemaining: number;
    month: string;
  };
  upcomingNext: Array<{
    id: string;
    clientName: string;
    sessionType: string;
    dateTime: string;
    status: "confirmed" | "awaitingPayment" | "paid";
    highlighted: boolean;
  }>;
  sessions: CalendarSessionSummary[];
};

export type CalendarSessionSummary = {
  id: string;
  year: number;
  monthIndex: number;
  day: number;
  category: string;
  clientNames: string;
  status: "paid" | "confirmed";
  imageAssetKey: string;
  time: string;
  package: string;
  location: string;
};
