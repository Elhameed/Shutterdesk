import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { ROUTES } from "@/constants/routes";
import type { CalendarViewMode } from "@/features/photographer-calendar/lib/calendar-navigation";
import { cn } from "@/lib/utils";

type CalendarControlsProps = {
  periodLabel: string;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

const viewOptions: CalendarViewMode[] = ["day", "week", "month"];

export function CalendarPageHeader() {
  const copy = CALENDAR_COPY;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
        {copy.pageTitle}
      </h1>
      <p className="mt-1 text-sm text-muted">{copy.pageSubtitle}</p>
    </div>
  );
}

export function CalendarControls({
  periodLabel,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarControlsProps) {
  const copy = CALENDAR_COPY;
  const previousLabel = copy.navigation.previous[view];
  const nextLabel = copy.navigation.next[view];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-white">
          <button
            type="button"
            onClick={onPrevious}
            className="rounded-l-lg p-2 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
            aria-label={previousLabel}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="border-x border-border px-3 py-2 text-xs font-semibold text-charcoal transition-colors hover:bg-gray-50"
          >
            {copy.today}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-r-lg p-2 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
            aria-label={nextLabel}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <p className="text-base font-bold text-charcoal sm:text-lg">
          {periodLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex rounded-lg border border-border bg-gray-100 p-1">
          {viewOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onViewChange(option)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-semibold capitalize transition-colors",
                view === option
                  ? "bg-white text-charcoal shadow-sm"
                  : "text-muted hover:text-charcoal",
              )}
            >
              {copy.views[option]}
            </button>
          ))}
        </div>

        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
          <Link to={ROUTES.photographer.bookingsNew}>
            <Plus className="size-4" />
            {copy.newBooking}
          </Link>
        </Button>
      </div>
    </div>
  );
}
