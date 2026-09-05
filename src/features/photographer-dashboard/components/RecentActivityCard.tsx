import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { ROUTES } from "@/constants/routes";
import type { RecentActivity } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

type RecentActivityCardProps = {
  activities: RecentActivity[];
};

/**
 * Rows are separated by shared 1px dividers rather than a timeline rail with a
 * per-type colored dot — five decorative accent colors in a sidebar card was
 * exactly the "accent as decoration" pattern the redesign removes.
 */
export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.recentActivity;

  return (
    <section className="min-w-0">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <Link
            to={ROUTES.photographer.activity}
            className="text-accent hover:text-accent-hover shrink-0 text-xs transition-colors"
          >
            {copy.viewAll}
          </Link>
        </CardHeader>

        {activities.length === 0 ? (
          <p className="text-ink-faint px-4 py-5 text-sm">
            No recent activity yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {activities.map((item) => {
              const content = (
                <>
                  <p className="text-ink text-xs font-semibold">{item.title}</p>
                  <p className="text-ink-soft mt-0.5 text-xs leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-ink-faint mt-1 text-[10.5px]">
                    {item.time}
                  </p>
                </>
              );

              return (
                <li key={item.id}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      className={cn(
                        "hover:bg-paper-dim block px-4 py-3 transition-colors",
                      )}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="px-4 py-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
