import { Link } from "react-router-dom";
import { PHOTOGRAPHER_ACTIVITY_COPY } from "@/constants/photographer-activity";
import type { PhotographerActivity } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

const dotStyles = {
  booking: "bg-charcoal",
  payment: "bg-gold",
  gallery: "bg-gray-300",
  client: "bg-emerald-500",
  service: "bg-sky-500",
} as const;

type ActivityHistoryFeedProps = {
  activities: PhotographerActivity[];
};

export function ActivityHistoryFeed({ activities }: ActivityHistoryFeedProps) {
  const copy = PHOTOGRAPHER_ACTIVITY_COPY;

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        {copy.empty}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6">
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
                  <span className="mt-1 w-px flex-1 bg-gray-200" aria-hidden />
                ) : null}
              </div>
              <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {item.description}
                </p>
                <p className="mt-1 text-[10px] font-medium tracking-wide text-muted-light uppercase">
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
                  className="flex gap-3 rounded-lg transition-colors hover:bg-gray-50"
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
