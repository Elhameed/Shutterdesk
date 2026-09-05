import { Link } from "react-router-dom";
import { PHOTOGRAPHER_ACTIVITY_COPY } from "@/constants/photographer-activity";
import type { PhotographerActivity } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

const dotStyles = {
  booking: "bg-ink",
  payment: "bg-accent",
  gallery: "bg-border-strong",
  client: "bg-ok",
  service: "bg-sky-500",
} as const;

type ActivityHistoryFeedProps = {
  activities: PhotographerActivity[];
};

export function ActivityHistoryFeed({ activities }: ActivityHistoryFeedProps) {
  const copy = PHOTOGRAPHER_ACTIVITY_COPY;

  if (activities.length === 0) {
    return (
      <div className="rounded-md border border-border bg-panel p-8 text-center text-sm text-ink-soft">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-panel p-5 sm:p-6">
      <ul>
        {activities.map((item, index) => {
          const isLast = index === activities.length - 1;
          const content = (
            <>
              <div className="flex w-2 shrink-0 flex-col items-center self-stretch">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    dotStyles[item.type],
                  )}
                  aria-hidden
                />
                {!isLast ? (
                  <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                  {item.description}
                </p>
                <p className="mt-1 text-[10px] font-medium text-ink-faint">
                  {item.time}
                </p>
              </div>
            </>
          );

          if (item.href) {
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className="flex gap-3 rounded-sm transition-colors hover:bg-paper-dim"
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.id} className="flex gap-3">
              {content}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
