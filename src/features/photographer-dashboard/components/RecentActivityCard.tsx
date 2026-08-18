import { Link } from "react-router-dom";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { ROUTES } from "@/constants/routes";
import type { RecentActivity } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

const dotStyles = {
  booking: "bg-charcoal",
  payment: "bg-gold",
  gallery: "bg-gray-300",
  client: "bg-emerald-500",
  service: "bg-sky-500",
} as const;

type RecentActivityCardProps = {
  activities: RecentActivity[];
};

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.recentActivity;

  return (
    <section className="min-w-0">
      <h2 className="mb-4 text-base font-bold text-charcoal">{copy.title}</h2>

      <div className="rounded-xl border border-border bg-white p-5">
        {activities.length === 0 ? (
          <p className="text-sm text-muted">No recent activity yet.</p>
        ) : (
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
                    {!isLast && (
                      <span
                        className="mt-1 w-px flex-1 bg-gray-200"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
                    <p className="text-sm font-semibold text-charcoal">
                      {item.title}
                    </p>
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
        )}

        <Link
          to={ROUTES.photographer.activity}
          className="mt-5 block w-full text-center text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
        >
          {copy.viewAll}
        </Link>
      </div>
    </section>
  );
}
