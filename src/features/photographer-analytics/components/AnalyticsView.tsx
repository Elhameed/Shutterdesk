import { useEffect, useRef, useState } from "react";
import { AnalyticsHeader } from "@/features/photographer-analytics/components/AnalyticsHeader";
import { AnalyticsKpiCards } from "@/features/photographer-analytics/components/AnalyticsKpiCards";
import { BookingsVolumeCard } from "@/features/photographer-analytics/components/BookingsVolumeCard";
import { PopularServicesCard } from "@/features/photographer-analytics/components/PopularServicesCard";
import { RevenueChartCard } from "@/features/photographer-analytics/components/RevenueChartCard";
import { TopClientsCard } from "@/features/photographer-analytics/components/TopClientsCard";
import { photographerApi } from "@/services/photographer";
import type { PhotographerAnalyticsSummary } from "@/types/domains/analytics";
import { cn } from "@/lib/utils";
import { CardSkeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState("30");
  const [analytics, setAnalytics] = useState<PhotographerAnalyticsSummary | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    setIsRefreshing(hasLoadedRef.current);
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    setError(null);

    void photographerApi.analytics
      .getSummary(dateRange)
      .then((data) => {
        if (cancelled) return;
        hasLoadedRef.current = true;
        setAnalytics(data);
        setIsLoading(false);
        setIsRefreshing(false);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(getApiErrorMessage(fetchError, "Could not load analytics"));
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  if (isLoading && !analytics) {
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
        <p className="text-sm text-red-600" role="alert">
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
