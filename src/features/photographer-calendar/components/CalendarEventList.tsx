import { SESSION_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import type { CalendarEvent } from "@/types/domains/calendar";
import { cn } from "@/lib/utils";

export const calendarEventStyles = {
  editorial: "bg-gold-light text-gold",
  travel: "text-[10px] font-semibold tracking-wide text-muted uppercase",
  wedding: "bg-charcoal text-white",
  product: SESSION_STATUS_BADGE_STYLES.paid,
  confirmed: SESSION_STATUS_BADGE_STYLES.confirmed,
  awaitingPayment: SESSION_STATUS_BADGE_STYLES.awaitingPayment,
  paid: SESSION_STATUS_BADGE_STYLES.paid,
} as const;

type CalendarEventListProps = {
  events: CalendarEvent[];
  compact?: boolean;
};

export function CalendarEventList({
  events,
  compact = false,
}: CalendarEventListProps) {
  if (events.length === 0) return null;

  return (
    <div className={cn("space-y-1", !compact && "space-y-2")}>
      {events.map((event) => (
        <div
          key={event.id}
          className={cn(
            "truncate rounded px-2 py-1 font-medium",
            compact ? "text-[9px] sm:text-[10px]" : "text-sm",
            calendarEventStyles[event.variant],
            event.variant === "travel" && "px-0 py-0",
          )}
        >
          {event.label}
        </div>
      ))}
    </div>
  );
}
