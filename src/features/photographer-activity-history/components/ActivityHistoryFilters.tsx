import {
  ACTIVITY_RANGE_FILTERS,
  ACTIVITY_TYPE_FILTERS,
  PHOTOGRAPHER_ACTIVITY_COPY,
  type ActivityRangeFilter,
  type ActivityTypeFilter,
} from "@/constants/photographer-activity";
import { cn } from "@/lib/utils";

type ActivityHistoryFiltersProps = {
  activeType: ActivityTypeFilter;
  activeRange: ActivityRangeFilter;
  onTypeChange: (type: ActivityTypeFilter) => void;
  onRangeChange: (range: ActivityRangeFilter) => void;
};

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-gold bg-gold-light text-charcoal"
          : "border-border bg-white text-muted hover:border-gold/40 hover:text-charcoal",
      )}
    >
      {label}
    </button>
  );
}

export function ActivityHistoryFilters({
  activeType,
  activeRange,
  onTypeChange,
  onRangeChange,
}: ActivityHistoryFiltersProps) {
  const copy = PHOTOGRAPHER_ACTIVITY_COPY;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-5">
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.typeFilterLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIVITY_TYPE_FILTERS.map((type) => (
            <FilterChip
              key={type}
              active={activeType === type}
              label={copy.types[type]}
              onClick={() => onTypeChange(type)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.rangeFilterLabel}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACTIVITY_RANGE_FILTERS.map((range) => (
            <FilterChip
              key={range}
              active={activeRange === range}
              label={copy.ranges[range]}
              onClick={() => onRangeChange(range)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
