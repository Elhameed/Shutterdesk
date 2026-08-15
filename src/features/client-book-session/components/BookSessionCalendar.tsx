import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { formatMonthYear } from "@/constants/client-book-session";
import { toDateKey } from "@/types/domains/availability";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type BookSessionCalendarProps = {
  month: Date;
  selected: Date | null;
  availableDates?: string[];
  isLoading?: boolean;
  onSelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function BookSessionCalendar({
  month,
  selected,
  availableDates = [],
  isLoading = false,
  onSelect,
  onMonthChange,
}: BookSessionCalendarProps) {
  const first = startOfMonth(month);
  const startPad = first.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const prevMonthDays = new Date(
    month.getFullYear(),
    month.getMonth(),
    0,
  ).getDate();

  const availableSet = new Set(availableDates);
  const cells: { date: Date; muted: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i -= 1) {
    cells.push({
      date: new Date(
        month.getFullYear(),
        month.getMonth() - 1,
        prevMonthDays - i,
      ),
      muted: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: new Date(month.getFullYear(), month.getMonth(), day),
      muted: false,
    });
  }

  while (cells.length % 7 !== 0) {
    const day = cells.length - startPad - daysInMonth + 1;
    cells.push({
      date: new Date(month.getFullYear(), month.getMonth() + 1, day),
      muted: true,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-charcoal">
          {formatMonthYear(month)}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-3.5 w-40" />
      ) : null}

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-[10px] font-semibold tracking-wider text-muted-light uppercase"
          >
            {day}
          </span>
        ))}

        {cells.map(({ date, muted }) => {
          const isSelected = selected ? isSameDay(date, selected) : false;
          const isAvailable =
            !muted && availableSet.has(toDateKey(date));
          const isUnavailable = !muted && !isAvailable && !isLoading;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={muted || isUnavailable}
              onClick={() => onSelect(date)}
              className={cn(
                "mx-auto flex size-9 items-center justify-center rounded-lg text-sm transition-colors",
                muted && "cursor-default text-muted-light/70",
                isUnavailable && "cursor-not-allowed text-muted-light/50",
                !muted &&
                  isAvailable &&
                  !isSelected &&
                  "text-charcoal hover:bg-gray-100",
                isSelected && "bg-charcoal font-semibold text-white",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
