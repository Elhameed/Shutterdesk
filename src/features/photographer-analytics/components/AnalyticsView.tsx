import { useState } from "react";
import { AnalyticsHeader } from "@/features/photographer-analytics/components/AnalyticsHeader";
import { AnalyticsKpiCards } from "@/features/photographer-analytics/components/AnalyticsKpiCards";
import { BookingsVolumeCard } from "@/features/photographer-analytics/components/BookingsVolumeCard";
import { PopularServicesCard } from "@/features/photographer-analytics/components/PopularServicesCard";
import { RevenueChartCard } from "@/features/photographer-analytics/components/RevenueChartCard";
import { TopClientsCard } from "@/features/photographer-analytics/components/TopClientsCard";
import { cn } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/skeleton";
import { getQueryErrorMessage } from "@/lib/api-error";
import { usePhotographerAnalytics } from "@/hooks/queries/photographer";

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState("30");

  // `placeholderData` keeps the previous range's numbers on screen while a new
  // range loads, which is what the hand-rolled `hasLoadedRef` was approximating
  // to tell a first load apart from a refresh. Query also cancels the in-flight
  // request when the range changes, replacing the manual `cancelled` flag.
  const {
    data: analytics,
    isPending,
    isFetching,
    error: queryError,
  } = usePhotographerAnalytics(dateRange);

  const isRefreshing = isFetching && !isPending;
  const error = queryError
    ? getQueryErrorMessage(queryError, "Could not load analytics")
    : null;

  if (isPending) {
    return (
      <div className="min-w-0 max-w-full space-y-4 p-4 sm:p-6 lg:p-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-sm text-bad-fg" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-w-0 max-w-full p-4 transition-opacity sm:p-6 lg:p-8",
        isRefreshing && "opacity-60",
      )}
    >
      <AnalyticsHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="mt-6">
        <AnalyticsKpiCards kpis={analytics.kpis} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <RevenueChartCard analytics={analytics} />
        <BookingsVolumeCard
          data={analytics.bookingsVolumeData}
          totalBookings={analytics.totalBookings}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <PopularServicesCard services={analytics.popularServices} />
        <TopClientsCard clients={analytics.topClients} />
      </div>
    </div>
  );
}
