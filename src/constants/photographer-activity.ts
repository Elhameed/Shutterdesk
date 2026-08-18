import type { RecentActivityType } from "@/types/domains/dashboard";

export type ActivityTypeFilter = RecentActivityType | "all";
export type ActivityRangeFilter = "all" | "7d" | "30d";

export const PHOTOGRAPHER_ACTIVITY_COPY = {
  title: "Activity History",
  subtitle: "A chronological record of studio bookings, payments, galleries, and more.",
  backToDashboard: "Dashboard",
  empty: "No activity matches your filters yet.",
  loadMore: "Load more activity",
  loading: "Loading activity…",
  typeFilterLabel: "Activity type",
  rangeFilterLabel: "Date range",
  types: {
    all: "All",
    booking: "Bookings",
    payment: "Payments",
    gallery: "Galleries",
    client: "Clients",
    service: "Services",
  },
  ranges: {
    all: "All time",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
  },
} as const;

export const ACTIVITY_TYPE_FILTERS: ActivityTypeFilter[] = [
  "all",
  "booking",
  "payment",
  "gallery",
  "client",
  "service",
];

export const ACTIVITY_RANGE_FILTERS: ActivityRangeFilter[] = ["all", "7d", "30d"];
