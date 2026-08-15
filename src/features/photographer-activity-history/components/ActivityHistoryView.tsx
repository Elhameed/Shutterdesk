import { useCallback, useEffect, useState } from "react";
import { PortalBreadcrumbs } from "@/components/common/PortalBreadcrumbs";
import { Button } from "@/components/ui/button";
import {
  PHOTOGRAPHER_ACTIVITY_COPY,
  type ActivityRangeFilter,
  type ActivityTypeFilter,
} from "@/constants/photographer-activity";
import { ROUTES } from "@/constants/routes";
import { ActivityHistoryFeed } from "@/features/photographer-activity-history/components/ActivityHistoryFeed";
import { ActivityHistoryFilters } from "@/features/photographer-activity-history/components/ActivityHistoryFilters";
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ActivityFeedSkeleton } from "@/components/skeletons";
import type { PhotographerActivity } from "@/types/domains/dashboard";

const PAGE_SIZE = 20;

export function ActivityHistoryView() {
  const copy = PHOTOGRAPHER_ACTIVITY_COPY;
  const [activities, setActivities] = useState<PhotographerActivity[]>([]);
  const [activeType, setActiveType] = useState<ActivityTypeFilter>("all");
  const [activeRange, setActiveRange] = useState<ActivityRangeFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(
    async (nextPage: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await photographerApi.activity.list({
          page: nextPage,
          limit: PAGE_SIZE,
          type: activeType,
          range: activeRange,
        });

        setActivities((current) =>
          append ? [...current, ...result.items] : result.items,
        );
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load activity history."));
        if (!append) {
          setActivities([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeRange, activeType],
  );

  useEffect(() => {
    void loadActivities(1, false);
  }, [loadActivities]);

  const hasMore = page < totalPages;

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalBreadcrumbs
        items={[
          { label: copy.backToDashboard, href: ROUTES.photographer.dashboard },
          { label: copy.title },
        ]}
        className="mb-4"
      />

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <ActivityHistoryFilters
          activeType={activeType}
          activeRange={activeRange}
          onTypeChange={setActiveType}
          onRangeChange={setActiveRange}
        />

        <div className="space-y-4">
          {showSkeleton ? (
            <ActivityFeedSkeleton rows={8} />
          ) : isLoading ? null : error ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          ) : (
            <ActivityHistoryFeed activities={activities} />
          )}

          {hasMore && !isLoading ? (
            <div className="text-center">
              <Button
                variant="outline"
                disabled={isLoadingMore}
                onClick={() => void loadActivities(page + 1, true)}
              >
                {isLoadingMore ? copy.loading : copy.loadMore}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
