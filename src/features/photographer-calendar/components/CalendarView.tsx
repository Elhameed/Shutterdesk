import { useEffect, useState } from "react";
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
import { photographerApi } from "@/services/photographer";
import type { CalendarMonthData } from "@/types/domains/calendar";

export function CalendarView() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [focusDate, setFocusDate] = useState<CalendarDate | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarMonthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  useEffect(() => {
    void photographerApi.calendar
      .getMonth(new Date().getMonth() + 1, new Date().getFullYear())
      .then((data) => {
        setCalendarData(data);
        setFocusDate((current) =>
          current ?? {
            year: data.month.year,
            monthIndex: data.month.monthIndex,
            day: data.today.day,
          },
        );
        setIsLoading(false);
      })
      .catch((fetchError) => {
        setError(getApiErrorMessage(fetchError, "Unable to load calendar."));
        setIsLoading(false);
      });
  }, []);

  const refreshCalendar = () => {
    if (!focusDate) return;
    void photographerApi.calendar
      .getMonth(focusDate.monthIndex + 1, focusDate.year)
      .then(setCalendarData);
  };

  useEffect(() => {
    if (!focusDate) return;

    void photographerApi.calendar
      .getMonth(focusDate.monthIndex + 1, focusDate.year)
      .then(setCalendarData);
  }, [focusDate?.monthIndex, focusDate?.year]);

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
    isLoading || !calendarData || !focusDate,
  );

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="max-w-md text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (showSkeleton) {
    return <CalendarSkeleton />;
  }

  if (isLoading || !calendarData || !focusDate) {
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
