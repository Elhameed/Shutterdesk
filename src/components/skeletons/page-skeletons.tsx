import { Skeleton } from "@/components/ui/skeleton";
import {
  ActivityFeedSkeleton,
  NotificationsFeedSkeleton,
  TableRowsSkeleton,
} from "@/components/skeletons/list-skeletons";
import {
  CardGridSkeleton,
  ClientCardSkeleton,
  ClientGalleryCardSkeleton,
  GalleryCardSkeleton,
  ServicePackageCardSkeleton,
  StatCardGridSkeleton,
} from "@/components/skeletons/card-skeletons";
import { cn } from "@/lib/utils";

const PAGE_WRAPPER = "min-w-0 max-w-full p-4 sm:p-6 lg:p-8";

/** Page title + subtitle block. */
export function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      {withAction ? <Skeleton className="h-10 w-32 rounded-lg" /> : null}
    </div>
  );
}

/** Search field + filter chips row. */
export function FilterBarSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

type ListPageSkeletonProps = {
  /** Which card skeleton to tile in the grid. */
  variant?: "gallery" | "clientGallery" | "service" | "client";
  count?: number;
  /** Render rows in a bordered table instead of a card grid. */
  asTable?: boolean;
};

const CARD_BY_VARIANT = {
  gallery: GalleryCardSkeleton,
  clientGallery: ClientGalleryCardSkeleton,
  service: ServicePackageCardSkeleton,
  client: ClientCardSkeleton,
} as const;

/** Header + search/filter + grid|table — the shared list-page shape. */
export function ListPageSkeleton({
  variant = "gallery",
  count = 6,
  asTable = false,
}: ListPageSkeletonProps) {
  return (
    <div className={PAGE_WRAPPER}>
      <PageHeaderSkeleton />
      <div className="mt-6">
        <FilterBarSkeleton />
      </div>
      <div className="mt-5">
        {asTable ? (
          <TableRowsSkeleton rows={count} />
        ) : (
          <CardGridSkeleton count={count} Card={CARD_BY_VARIANT[variant]} />
        )}
      </div>
    </div>
  );
}

/** Photographer dashboard — greeting, 4 stat cards, [7fr_3fr] split. */
export function PhotographerDashboardSkeleton() {
  return (
    <div className={PAGE_WRAPPER}>
      <div className="mb-6 flex items-center justify-between gap-4" aria-hidden>
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <StatCardGridSkeleton count={4} />

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[7fr_3fr] lg:items-start">
        <TableRowsSkeleton rows={5} />
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
          <ActivityFeedSkeleton rows={4} />
        </div>
      </div>
    </div>
  );
}

/** Client dashboard — stat cards + recent updates + upcoming/gallery cards. */
export function ClientDashboardSkeleton() {
  return (
    <div className={PAGE_WRAPPER}>
      <div className="mb-6 space-y-2" aria-hidden>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-40" />
      </div>
      <StatCardGridSkeleton count={4} />
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
        <ActivityFeedSkeleton rows={5} />
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          </div>
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-4 h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

type DetailPageSkeletonProps = {
  /** Sidebar width preset for the two-column layouts. */
  sidebar?: "narrow" | "wide";
};

/** Two-column detail page (booking/client/gallery detail). */
export function DetailPageSkeleton({ sidebar = "wide" }: DetailPageSkeletonProps) {
  const grid =
    sidebar === "narrow"
      ? "lg:grid-cols-[280px_1fr]"
      : "lg:grid-cols-[1fr_320px]";

  return (
    <div className={PAGE_WRAPPER}>
      <Skeleton className="h-4 w-40" aria-hidden />
      <div className="mt-4 space-y-2" aria-hidden>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3.5 w-1/3" />
      </div>

      <div className={cn("mt-6 grid min-w-0 gap-6 lg:items-start", grid)}>
        <div className="min-w-0 space-y-6">
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/6" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="mt-4 h-40 w-full rounded-lg" />
          </div>
        </div>
        <div className="min-w-0 space-y-6">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-white p-5"
              aria-hidden
            >
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Form-heavy page (settings, profile, edit). */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className={PAGE_WRAPPER}>
      <PageHeaderSkeleton withAction={false} />
      <div
        className="mt-6 space-y-6 rounded-xl border border-border bg-white p-5 sm:p-6"
        role="status"
        aria-busy
        aria-label="Loading form"
      >
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-11 w-24 rounded-lg" />
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Calendar page — toolbar + month grid + selected-session card. */
export function CalendarSkeleton() {
  return (
    <div className={PAGE_WRAPPER}>
      <div className="mb-6 flex items-center justify-between gap-4" aria-hidden>
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div
          className="rounded-xl border border-border bg-white p-4"
          role="status"
          aria-busy
          aria-label="Loading calendar"
        >
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-4 h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Notifications page — header + [sidebar_feed] two-column. */
export function NotificationsPageSkeleton({
  withSidebar = false,
}: {
  withSidebar?: boolean;
}) {
  return (
    <div className={PAGE_WRAPPER}>
      <PageHeaderSkeleton />
      {withSidebar ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
            <Skeleton className="h-3 w-20" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <NotificationsFeedSkeleton rows={5} />
        </div>
      ) : (
        <div className="mt-6">
          <NotificationsFeedSkeleton rows={5} />
        </div>
      )}
    </div>
  );
}

/**
 * App-shell skeleton for the lazy route fallback: a sidebar column plus a
 * content region, so page transitions look like the page materializing.
 */
export function AppShellSkeleton() {
  return (
    <div
      className="flex min-h-screen bg-[#f7f7f5]"
      role="status"
      aria-busy
      aria-label="Loading"
    >
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-white p-5 lg:flex">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className={PAGE_WRAPPER}>
          <PageHeaderSkeleton />
          <div className="mt-6">
            <StatCardGridSkeleton count={4} />
          </div>
          <div className="mt-6">
            <TableRowsSkeleton rows={5} />
          </div>
        </div>
      </main>
    </div>
  );
}
