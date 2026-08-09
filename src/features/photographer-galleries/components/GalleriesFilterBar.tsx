import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  GALLERIES_COPY,
  type GalleryCategoryFilter,
  type GallerySortOption,
  type GalleryStatusFilter,
} from "@/constants/photographer-galleries";
import { cn } from "@/lib/utils";

type GalleriesFilterBarProps = {
  categoryFilter: GalleryCategoryFilter;
  statusFilter: GalleryStatusFilter;
  sortBy: GallerySortOption;
  onCategoryChange: (value: GalleryCategoryFilter) => void;
  onStatusChange: (value: GalleryStatusFilter) => void;
  onSortChange: (value: GallerySortOption) => void;
};

type FilterPillProps = {
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
  children: ReactNode;
};

function FilterPill({
  value,
  onChange,
  "aria-label": ariaLabel,
  children,
}: FilterPillProps) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-full border border-border bg-white py-0 pr-8 pl-4 text-xs font-medium text-charcoal",
          "transition-colors hover:bg-gray-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20",
        )}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}

export function GalleriesFilterBar({
  categoryFilter,
  statusFilter,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
}: GalleriesFilterBarProps) {
  const copy = GALLERIES_COPY;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          value={categoryFilter}
          onChange={(value) => onCategoryChange(value as GalleryCategoryFilter)}
          aria-label={copy.category}
        >
          <option value="all">
            {copy.category}: {copy.all}
          </option>
          {Object.entries(copy.categories).map(([value, label]) => (
            <option key={value} value={value}>
              {copy.category}: {label}
            </option>
          ))}
        </FilterPill>

        <FilterPill
          value={statusFilter}
          onChange={(value) => onStatusChange(value as GalleryStatusFilter)}
          aria-label={copy.status}
        >
          <option value="all">
            {copy.status}: {copy.all}
          </option>
          {Object.entries(copy.statuses).map(([value, label]) => (
            <option key={value} value={value}>
              {copy.status}: {label}
            </option>
          ))}
        </FilterPill>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted">{copy.sortBy}:</span>
        <FilterPill
          value={sortBy}
          onChange={(value) => onSortChange(value as GallerySortOption)}
          aria-label={copy.sortBy}
        >
          {Object.entries(copy.sortOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FilterPill>
      </div>
    </div>
  );
}
