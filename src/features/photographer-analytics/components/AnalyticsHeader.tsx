import { Calendar, ChevronDown } from "lucide-react";
import { PhotographerPageHeader } from "@/components/photographer/PhotographerPageHeader";
import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import { cn } from "@/lib/utils";

type AnalyticsHeaderProps = {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
};

export function AnalyticsHeader({
  dateRange,
  onDateRangeChange,
}: AnalyticsHeaderProps) {
  const copy = ANALYTICS_COPY;

  return (
    <PhotographerPageHeader
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <div className="relative shrink-0">
          <Calendar
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <select
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value)}
            aria-label={copy.dateRange}
            className={cn(
              "h-10 min-w-[160px] cursor-pointer appearance-none rounded-lg border border-border bg-white py-0 pr-8 pl-10 text-sm font-medium text-charcoal",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20",
            )}
          >
            {Object.entries(copy.dateRanges).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </div>
      }
    />
  );
}
