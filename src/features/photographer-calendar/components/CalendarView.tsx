import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AvailabilityManageDrawer,
  AvailabilityManageTrigger,
} from "@/features/photographer-calendar/components/AvailabilityManageDrawer";
import { AvailabilityOverview } from "@/features/photographer-calendar/components/AvailabilityOverview";
import { CalendarDayView } from "@/features/photographer-calendar/components/CalendarDayView";
import { CalendarGrid } from "@/features/photographer-calendar/components/CalendarGrid";
import {
  CalendarControls,
  CalendarPageHeader,
} from "@/features/photographer-calendar/components/CalendarToolbar";
import { CalendarWeekView } from "@/features/photographer-calendar/components/CalendarWeekView";
import { SelectedSessionCard } from "@/features/photographer-calendar/components/SelectedSessionCard";
import { UpcomingNextList } from "@/features/photographer-calendar/components/UpcomingNextList";
import { CalendarDataContext } from "@/features/photographer-calendar/lib/calendar-data-context";
import { CalendarSkeleton } from "@/components/skeletons";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import {
  formatPeriodLabel,
  navigateCalendarDate,
  type CalendarDate,
  type CalendarViewMode,
} from "@/features/photographer-calendar/lib/calendar-navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { usePhotographerCalendar } from "@/hooks/queries/photographer";
import { queryKeys } from "@/lib/query-keys";

export function CalendarView() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [focusDate, setFocusDate] = useState<CalendarDate | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const queryClient = useQueryClient();

  // Before focusDate is known, ask for the current month. Once the response
  // arrives, focusDate is derived from the server's idea of today — which is
  // why it comes from the payload rather than the browser clock — and the query
  // follows it from then on.
  const now = new Date();
  const month = focusDate ? focusDate.monthIndex + 1 : now.getMonth() + 1;
  const year = focusDate ? focusDate.year : now.getFullYear();

  const {
    data: calendarData,
    isPending,
    error: queryError,
  } = usePhotographerCalendar(month, year);

  const error = queryError
    ? getApiErrorMessage(queryError, "Unable to load calendar.")
    : null;

  useEffect(() => {
    if (!calendarData || focusDate) return;
    setFocusDate({
      year: calendarData.month.year,
      monthIndex: calendarData.month.monthIndex,
      day: calendarData.today.day,
    });
  }, [calendarData, focusDate]);

  const refreshCalendar = () => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.photographer.calendar(month, year),
    });
  };

  const handlePrevious = () => {
    if (!focusDate) return;
    setFocusDate((current) =>
      current ? navigateCalendarDate(current, view, -1) : current,
    );
  };

  const handleNext = () => {
    if (!focusDate) return;
    setFocusDate((current) =>
      current ? navigateCalendarDate(current, view, 1) : current,
    );
  };

  const handleToday = () => {
    if (!calendarData) return;
    setFocusDate(calendarData.today);
  };

  const handleSelectDay = (date: CalendarDate) => {
    setFocusDate(date);
  };

  const showSkeleton = useDelayedLoading(
    isPending || !calendarData || !focusDate,
  );

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="max-w-md text-center text-sm text-bad-fg" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (showSkeleton) {
    return <CalendarSkeleton />;
  }

  if (isPending || !calendarData || !focusDate) {
    return null;
  }

  return (
    <CalendarDataContext.Provider value={calendarData}>
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <div className="grid min-w-0 gap-x-6 gap-y-6 xl:grid-cols-[1fr_320px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <CalendarPageHeader />

            <CalendarControls
              periodLabel={formatPeriodLabel(focusDate, view)}
              view={view}
              onViewChange={setView}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToday={handleToday}
            />

            {view === "day" && <CalendarDayView focusDate={focusDate} />}
            {view === "week" && (
              <CalendarWeekView
                focusDate={focusDate}
                onSelectDay={handleSelectDay}
              />
            )}
            {view === "month" && (
              <CalendarGrid focusDate={focusDate} onSelectDay={handleSelectDay} />
            )}
          </div>

          <aside className="min-w-0 max-w-full space-y-4 overflow-hidden">
            <AvailabilityOverview />
            <AvailabilityManageTrigger onOpen={() => setAvailabilityOpen(true)} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <SelectedSessionCard focusDate={focusDate} onUpdated={refreshCalendar} />
              <UpcomingNextList />
            </div>
          </aside>
        </div>

        <AvailabilityManageDrawer
          open={availabilityOpen}
          onClose={() => setAvailabilityOpen(false)}
          focusDate={focusDate}
          onUpdated={refreshCalendar}
        />
      </div>
    </CalendarDataContext.Provider>
  );
}
