import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Base skeleton atom. A neutral gray fill with a subtle shimmer sweep
 * (see `.skeleton-shimmer` in globals.css; degrades to a static fill under
 * `prefers-reduced-motion`). Compose with width/height/radius utilities.
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton-shimmer relative overflow-hidden rounded-md bg-gray-200/80",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}

type SkeletonTextProps = {
  /** Number of lines to render. */
  lines?: number;
  className?: string;
  lineClassName?: string;
  /** Width of the final line so paragraphs read naturally. */
  lastLineWidth?: string;
};

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  lastLineWidth = "60%",
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }, (_, index) => {
        const isLast = index === lines - 1 && lines > 1;
        return (
          <Skeleton
            key={index}
            className={cn("h-3.5", isLast ? undefined : "w-full", lineClassName)}
            {...(isLast ? { style: { width: lastLineWidth } } : {})}
          />
        );
      })}
    </div>
  );
}

type SkeletonCircleProps = {
  className?: string;
};

/** Circular skeleton (avatars, icon chips). Size via `size-*` utility. */
export function SkeletonCircle({ className }: SkeletonCircleProps) {
  return <Skeleton className={cn("size-10 rounded-full", className)} />;
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-11 w-28 rounded-lg", className)} />;
}

export function SkeletonBadge({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-5 w-16 rounded-full", className)} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-busy aria-label="Loading content">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-white p-5"
      role="status"
      aria-busy
      aria-label="Loading content"
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-3 h-8 w-2/3" />
      <Skeleton className="mt-4 h-20 w-full" />
    </div>
  );
}
