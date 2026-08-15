export type AnalyticsKpiLabelKey =
  | "totalRevenue"
  | "sessionsCompleted"
  | "repeatClients"
  | "conversionRate";

export type AnalyticsKpi = {
  id: string;
  labelKey: AnalyticsKpiLabelKey;
  value: string;
  trend?: string;
  trendUp?: boolean;
  subtext?: string;
  icon: "banknote" | "camera" | "userPlus" | "trending";
};

export type RevenueChartPoint = {
  label: string;
  bar: number;
  line: number;
};

export type BookingsVolumePoint = {
  label: string;
  value: number;
};

export type PopularServiceStat = {
  name: string;
  bookings: number;
  share: number;
};

export type TopClientStatus = "highValue" | "goldStatus" | "loyalMember";

export type TopClientStat = {
  id: string;
  initials: string;
  name: string;
  sessions: number;
  spent: number;
  status: TopClientStatus;
};

export type PhotographerAnalyticsSummary = {
  kpis: AnalyticsKpi[];
  revenueMonthlyData: RevenueChartPoint[];
  revenueWeeklyData: RevenueChartPoint[];
  bookingsVolumeData: BookingsVolumePoint[];
  totalBookings: number;
  popularServices: PopularServiceStat[];
  topClients: TopClientStat[];
};
