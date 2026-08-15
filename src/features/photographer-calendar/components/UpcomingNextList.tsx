import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { SESSION_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import { cn } from "@/lib/utils";

export function UpcomingNextList() {
  const copy = CALENDAR_COPY;
  const { upcomingNext } = useCalendarData();

  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-card">
      <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
        {copy.upcomingNext}
      </h2>

      <ul className="mt-3 divide-y divide-border">
        {upcomingNext.map((item) => (
          <li
            key={item.id}
            className={cn(
              "py-3 first:pt-0 last:pb-0",
              item.highlighted && "rounded-lg bg-gold-light/40 px-2 -mx-2",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {item.clientName}
                </p>
                <p className="truncate text-xs text-muted">{item.sessionType}</p>
                <p className="mt-1 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {item.dateTime}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  SESSION_STATUS_BADGE_STYLES[item.status],
                )}
              >
                {copy.sessionStatus[item.status]}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
