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
    <section className="rounded-md border border-border bg-panel p-4">
      <p className="text-xs leading-relaxed text-ink-soft">{copy.manageAvailabilityHint}</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-panel px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-dim"
      >
        <CalendarClock className="size-4 text-accent" aria-hidden />
        {copy.manageAvailability}
      </button>
    </section>
  );
}
