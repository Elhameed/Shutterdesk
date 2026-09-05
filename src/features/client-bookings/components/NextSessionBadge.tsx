import { CalendarDays } from "lucide-react";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";

type NextSessionBadgeProps = {
  date: string;
};

export function NextSessionBadge({ date }: NextSessionBadgeProps) {
  const copy = CLIENT_BOOKINGS_COPY;

  return (
    <div className="flex shrink-0 items-center gap-3 rounded-md border border-border bg-panel px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
        <CalendarDays className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-ink-faint">
          {copy.nextSession}
        </p>
        <p className="text-sm font-bold text-ink">{date}</p>
      </div>
    </div>
  );
}
