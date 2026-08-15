import { CalendarClock } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { AvailabilityManageForm } from "@/features/photographer-calendar/components/AvailabilityManageForm";

type AvailabilityManageDrawerProps = {
  open: boolean;
  onClose: () => void;
  focusDate: { year: number; monthIndex: number; day: number } | null;
  onUpdated?: () => void;
};

export function AvailabilityManageDrawer({
  open,
  onClose,
  focusDate,
  onUpdated,
}: AvailabilityManageDrawerProps) {
  const copy = CALENDAR_COPY;

  return (
    <Drawer open={open} onClose={onClose} title={copy.manageAvailability}>
      {open ? (
        <AvailabilityManageForm
          focusDate={focusDate}
          onUpdated={onUpdated}
          onDismiss={onClose}
        />
      ) : null}
    </Drawer>
  );
}

type AvailabilityManageTriggerProps = {
  onOpen: () => void;
};

export function AvailabilityManageTrigger({ onOpen }: AvailabilityManageTriggerProps) {
  const copy = CALENDAR_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-card">
      <p className="text-xs leading-relaxed text-muted">{copy.manageAvailabilityHint}</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-gray-50"
      >
        <CalendarClock className="size-4 text-gold" aria-hidden />
        {copy.manageAvailability}
      </button>
    </section>
  );
}
