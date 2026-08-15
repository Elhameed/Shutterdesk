import type { ReactNode } from "react";
import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import type {
  ClientStatusFilter,
  ClientTypeFilter,
} from "@/constants/photographer-clients";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { cn } from "@/lib/utils";

type ClientsFilterBarProps = {
  statusFilter: ClientStatusFilter;
  typeFilter: ClientTypeFilter;
  dateFilter: string;
  onStatusChange: (value: ClientStatusFilter) => void;
  onTypeChange: (value: ClientTypeFilter) => void;
  onDateChange: (value: string) => void;
  onReset: () => void;
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

export function ClientsFilterBar({
  statusFilter,
  typeFilter,
  dateFilter,
  onStatusChange,
  onTypeChange,
  onDateChange,
  onReset,
}: ClientsFilterBarProps) {
  const copy = CLIENTS_COPY;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-light uppercase">
          <Filter className="size-3.5" aria-hidden />
          {copy.filters}
        </span>

        <FilterPill
          value={typeFilter}
          onChange={(value) => onTypeChange(value as ClientTypeFilter)}
          aria-label={copy.clientType}
        >
          <option value="all">{copy.clientType}</option>
          <option value="wedding">{copy.categories.wedding}</option>
          <option value="commercial">{copy.categories.commercial}</option>
          <option value="portrait">{copy.categories.portrait}</option>
          <option value="editorial">{copy.categories.editorial}</option>
        </FilterPill>

        <FilterPill
          value={statusFilter}
          onChange={(value) => onStatusChange(value as ClientStatusFilter)}
          aria-label={copy.clientStatus}
        >
          <option value="all">{copy.clientStatus}</option>
          <option value="vip">{copy.status.vip}</option>
          <option value="active">{copy.status.active}</option>
          <option value="new">{copy.status.new}</option>
        </FilterPill>

        <FilterPill
          value={dateFilter}
          onChange={onDateChange}
          aria-label={copy.dateAdded}
        >
          <option value="">{copy.dateAdded}</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="year">This year</option>
        </FilterPill>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-charcoal"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        {copy.reset}
      </button>
    </div>
  );
}
