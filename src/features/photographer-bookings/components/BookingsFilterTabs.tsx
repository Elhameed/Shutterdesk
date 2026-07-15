import type { BookingFilter } from "@/constants/photographer-bookings";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";
import { cn } from "@/lib/utils";

const filters: BookingFilter[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

type BookingsFilterTabsProps = {
  active: BookingFilter;
  counts: Record<BookingFilter, number>;
  onChange: (filter: BookingFilter) => void;
};

export function BookingsFilterTabs({
  active,
  counts,
  onChange,
}: BookingsFilterTabsProps) {
  const copy = BOOKINGS_COPY.filters;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            active === filter
              ? "border-charcoal bg-charcoal text-white"
              : "border-border bg-white text-charcoal hover:bg-gray-50",
          )}
        >
          {copy[filter]} {counts[filter]}
        </button>
      ))}
    </div>
  );
}
