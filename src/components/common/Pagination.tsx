import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getPaginationItems,
  useCompactPagination,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  summary?: string;
  className?: string;
  /** Footer bar with border and muted background */
  variant?: "inline" | "footer";
};

const navButtonClass =
  "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-muted transition-colors hover:bg-gray-100 hover:text-charcoal disabled:pointer-events-none disabled:opacity-40";

const pageButtonClass = (active: boolean) =>
  cn(
    "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
    active
      ? "bg-charcoal text-white"
      : "border border-border bg-white text-charcoal hover:bg-gray-100",
  );

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  summary,
  className,
  variant = "inline",
}: PaginationProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const compact = useCompactPagination(safeTotal);
  const items = getPaginationItems(safeCurrent, safeTotal);

  const goToPage = (page: number) => {
    if (page < 1 || page > safeTotal) return;
    onPageChange?.(page);
  };

  const controls = (
    <div className="flex items-center gap-1">
      {!compact && (
        <button
          type="button"
          className={navButtonClass}
          disabled={safeCurrent === 1}
          aria-label="First page"
          onClick={() => goToPage(1)}
        >
          <ChevronFirst className="size-4" />
        </button>
      )}

      <button
        type="button"
        className={navButtonClass}
        disabled={safeCurrent === 1}
        aria-label="Previous page"
        onClick={() => goToPage(safeCurrent - 1)}
      >
        <ChevronLeft className="size-4" />
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex size-8 shrink-0 items-center justify-center text-xs text-muted"
            aria-hidden
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={pageButtonClass(safeCurrent === item)}
            aria-label={`Page ${item}`}
            aria-current={safeCurrent === item ? "page" : undefined}
            onClick={() => goToPage(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={navButtonClass}
        disabled={safeCurrent === safeTotal}
        aria-label="Next page"
        onClick={() => goToPage(safeCurrent + 1)}
      >
        <ChevronRight className="size-4" />
      </button>

      {!compact && (
        <button
          type="button"
          className={navButtonClass}
          disabled={safeCurrent === safeTotal}
          aria-label="Last page"
          onClick={() => goToPage(safeTotal)}
        >
          <ChevronLast className="size-4" />
        </button>
      )}
    </div>
  );

  if (variant === "footer") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 border-t border-border bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
          className,
        )}
      >
        {summary ? <p className="text-xs text-muted">{summary}</p> : null}
        {controls}
      </div>
    );
  }

  if (summary) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <p className="text-xs text-muted">{summary}</p>
        {controls}
      </div>
    );
  }

  return <div className={className}>{controls}</div>;
}
