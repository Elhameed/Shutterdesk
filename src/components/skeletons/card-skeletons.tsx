import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Dashboard stat card — mirrors `StatCard` (rounded-xl border p-5). */
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-9 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}

export function StatCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-busy
      aria-label="Loading statistics"
    >
      {Array.from({ length: count }, (_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** Analytics KPI / metric card. */
export function AnalyticsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white p-5" aria-hidden>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-32" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Photographer gallery card — mirrors `GalleryCard` (aspect-[5/4] + p-4 footer). */
export function GalleryCardSkeleton() {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card"
      aria-hidden
    >
      <Skeleton className="aspect-[5/4] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <Skeleton className="mt-2 h-3 w-2/5" />
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </article>
  );
}

/** Client gallery card — mirrors `ClientGalleryCard` (aspect-[4/3] + footer). */
export function ClientGalleryCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-xl border border-border bg-white shadow-card"
      aria-hidden
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="px-4 py-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    </article>
  );
}

/** Service package card — mirrors `ServicePackageCard` (h-44/48 image + p-4). */
export function ServicePackageCardSkeleton() {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card"
      aria-hidden
    >
      <Skeleton className="h-44 w-full rounded-none sm:h-48" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <SkeletonText className="mt-2" lines={3} />
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </article>
  );
}

/** Client CRM card — mirrors `ClientCard` (banner + overlapping avatar). */
export function ClientCardSkeleton() {
  return (
    <article
      className="overflow-hidden rounded-xl border border-border bg-white shadow-card"
      aria-hidden
    >
      <Skeleton className="h-24 w-full rounded-none sm:h-28" />
      <div className="relative px-4 pb-4">
        <Skeleton className="absolute -top-8 left-4 size-16 rounded-full border-4 border-white" />
        <div className="pt-10">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="mt-2 h-3 w-3/5" />
          <Skeleton className="mt-1.5 h-3 w-2/5" />
          <Skeleton className="mt-3 h-4 w-20 rounded" />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Generic booking card (client/photographer list rows rendered as cards). */
export function BookingCardSkeleton() {
  return (
    <article
      className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-card"
      aria-hidden
    >
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </article>
  );
}

/** Payment card / obligation row. */
export function PaymentCardSkeleton() {
  return (
    <article
      className="rounded-xl border border-border bg-white p-5 shadow-card"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
      <div className="mt-4 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </article>
  );
}

type CardGridSkeletonProps = {
  count?: number;
  className?: string;
  Card: () => React.ReactElement;
  label?: string;
};

/** Render a grid of a given card skeleton — the shared list/grid loading shape. */
export function CardGridSkeleton({
  count = 6,
  className,
  Card,
  label = "Loading content",
}: CardGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      role="status"
      aria-busy
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} />
      ))}
    </div>
  );
}
