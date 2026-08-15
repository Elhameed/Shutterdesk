export type PaginationItem = number | "ellipsis";

const SIMPLE_PAGINATION_THRESHOLD = 4;

/** Page numbers (and ellipsis) to render between prev/next controls. */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  if (safeTotal < SIMPLE_PAGINATION_THRESHOLD) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  if (safeCurrent <= 3) {
    return [1, 2, 3, "ellipsis", safeTotal];
  }

  if (safeCurrent >= safeTotal - 2) {
    return [1, "ellipsis", safeTotal - 2, safeTotal - 1, safeTotal];
  }

  return [
    1,
    "ellipsis",
    safeCurrent - 1,
    safeCurrent,
    safeCurrent + 1,
    "ellipsis",
    safeTotal,
  ];
}

export function useCompactPagination(totalPages: number): boolean {
  return totalPages < SIMPLE_PAGINATION_THRESHOLD;
}

export function paginateSlice<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    total,
  };
}
