import { CalendarDays } from "lucide-react";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";

type NextSessionBadgeProps = {
  date: string;
};

export function NextSessionBadge({ date }: NextSessionBadgeProps) {
  const copy = CLIENT_BOOKINGS_COPY;

  return (
    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-card">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-light text-gold">
        <CalendarDays className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.nextSession}
        </p>
        <p className="text-sm font-bold text-charcoal">{date}</p>
      </div>
    </div>
  );
}
