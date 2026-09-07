import { useState } from "react";
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
import { usePhotographerActivityHistory } from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ActivityFeedSkeleton } from "@/components/skeletons";

const PAGE_SIZE = 20;

export function ActivityHistoryView() {
  const copy = PHOTOGRAPHER_ACTIVITY_COPY;
  const [activeType, setActiveType] = useState<ActivityTypeFilter>("all");
  const [activeRange, setActiveRange] = useState<ActivityRangeFilter>("all");

  const {
    data,
    isPending,
    error: queryError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePhotographerActivityHistory(
    { type: activeType, range: activeRange },
    PAGE_SIZE,
  );

  const showSkeleton = useDelayedLoading(isPending);
  const activities = data?.pages.flatMap((page) => page.items) ?? [];
  const error = queryError
    ? getApiErrorMessage(queryError, "Unable to load activity history.")
    : null;


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
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">{copy.subtitle}</p>
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
          ) : isPending ? null : error ? (
            <div
              className="rounded-md border border-bad/30 bg-bad-tint p-4 text-sm text-bad-fg"
              role="alert"
            >
              {error}
            </div>
          ) : (
            <ActivityHistoryFeed activities={activities} />
          )}

          {hasNextPage && !isPending ? (
            <div className="text-center">
              <Button
                variant="outline"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? copy.loading : copy.loadMore}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
