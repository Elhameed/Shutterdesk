import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeletons";
import {
  CLIENT_BOOK_SESSION_COPY,
  formatBookSessionDateShort,
} from "@/constants/client-book-session";
import { BookSessionCalendar } from "@/features/client-book-session/components/BookSessionCalendar";
import { clientApi } from "@/services/client";
import type { AvailabilitySlot } from "@/types/domains/availability";
import { toDateKey } from "@/types/domains/availability";
import type { ServicePackage } from "@/types/domains/service";
import { cn } from "@/lib/utils";

type BookSessionScheduleStepProps = {
  studioSlug: string;
  packageInfo: ServicePackage;
  month: Date;
  selectedDate: Date | null;
  selectedTime: string;
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function BookSessionScheduleStep({
  studioSlug,
  packageInfo,
  month,
  selectedDate,
  selectedTime,
  onMonthChange,
  onDateSelect,
  onTimeSelect,
  onBack,
  onContinue,
}: BookSessionScheduleStepProps) {
  const copy = CLIENT_BOOK_SESSION_COPY;
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!studioSlug || !packageInfo.id) return;

    setIsLoadingDates(true);
    void clientApi.availability
      .getAvailableDates(
        studioSlug,
        packageInfo.id,
        month.getMonth() + 1,
        month.getFullYear(),
      )
      .then((dates) => {
        setAvailableDates(dates);
        setIsLoadingDates(false);
      });
  }, [studioSlug, packageInfo.id, month]);

  useEffect(() => {
    if (!studioSlug || !packageInfo.id || !selectedDate) {
      setSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    void clientApi.availability
      .getSlots(studioSlug, packageInfo.id, toDateKey(selectedDate))
      .then((nextSlots) => {
        setSlots(nextSlots);
        setIsLoadingSlots(false);
      });
  }, [studioSlug, packageInfo.id, selectedDate]);

  useEffect(() => {
    if (slots.length === 0) return;
    if (!slots.some((slot) => slot.label === selectedTime)) {
      onTimeSelect(slots[0].label);
    }
  }, [slots, selectedTime, onTimeSelect]);

  return (
    <>
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-border">
        <div className="p-5 sm:p-6">
          <h2 className="text-base font-bold text-charcoal">
            {copy.scheduleStep.selectDate}
          </h2>
          <div className="mt-4">
            <BookSessionCalendar
              month={month}
              selected={selectedDate}
              availableDates={availableDates}
              isLoading={isLoadingDates}
              onSelect={onDateSelect}
              onMonthChange={onMonthChange}
            />
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <h2 className="text-base font-bold text-charcoal">
            {copy.scheduleStep.availableTime}
          </h2>
          {selectedDate ? (
            <p className="mt-1 text-xs text-muted">
              {copy.scheduleStep.selected(
                formatBookSessionDateShort(selectedDate),
              )}
            </p>
          ) : null}

          <ul className="mt-4 space-y-2">
            {isLoadingSlots ? (
              <li aria-busy aria-label="Loading available times">
                <div className="space-y-2">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-11 w-full rounded-xl" />
                  ))}
                </div>
              </li>
            ) : slots.length === 0 ? (
              <li className="text-sm text-muted">{copy.scheduleStep.noSlots}</li>
            ) : (
              slots.map((slot) => {
                const isSelected = slot.label === selectedTime;
                return (
                  <li key={slot.startsAt}>
                    <button
                      type="button"
                      onClick={() => onTimeSelect(slot.label)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                        isSelected
                          ? "border-gold bg-gold-light/50 text-charcoal"
                          : "border-border bg-white text-charcoal hover:bg-gray-50",
                      )}
                    >
                      {slot.label}
                      {isSelected ? (
                        <span className="flex size-6 items-center justify-center rounded-full bg-charcoal text-white">
                          <Check className="size-3.5" aria-hidden />
                        </span>
                      ) : (
                        <Clock className="size-4 text-muted-light" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="mt-auto border-l-4 border-gold bg-gray-50 p-4 pt-6 lg:mt-6">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              <Info className="size-3.5" aria-hidden />
              {copy.scheduleStep.currentSelection}
            </p>
            <p className="mt-1 text-sm font-bold text-charcoal">
              {packageInfo.title} ({packageInfo.details[0].label})
            </p>
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden />
          {copy.back}
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={!selectedDate || !selectedTime || slots.length === 0}
        >
          {copy.scheduleStep.continueToDetails}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </footer>
    </>
  );
}
