import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RowsProps = {
  rows?: number;
  className?: string;
  label?: string;
};

/** Bordered card wrapping evenly-spaced rows — for tables/lists. */
export function TableRowsSkeleton({
  rows = 6,
  className,
  label = "Loading rows",
}: RowsProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white",
        className,
      )}
      role="status"
      aria-busy
      aria-label={label}
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-4 px-5 py-4",
            index !== 0 && "border-t border-border",
          )}
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
          <Skeleton className="hidden h-3 w-16 md:block" />
        </div>
      ))}
    </div>
  );
}

/** A single notification card skeleton — mirrors the feed cards. */
export function NotificationCardSkeleton() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-border bg-white p-4 shadow-card sm:gap-4 sm:p-5"
      aria-hidden
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-12" />
        </div>
        <SkeletonText className="mt-2" lines={2} />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function NotificationsFeedSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-busy
      aria-label="Loading notifications"
    >
      {Array.from({ length: rows }, (_, index) => (
        <NotificationCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Activity/timeline feed skeleton. */
export function ActivityFeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="rounded-xl border border-border bg-white p-5"
      role="status"
      aria-busy
      aria-label="Loading activity"
    >
      <div className="space-y-5">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-3 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
