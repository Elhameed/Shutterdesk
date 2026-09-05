import { Link } from "react-router-dom";
import { CLIENT_DASHBOARD_COPY } from "@/constants/client-dashboard";
import { ROUTES } from "@/constants/routes";
import { getClientDashboardNotificationIcon } from "@/features/client-notifications/utils/category-icon";
import {
  useClientNotificationMutations,
  useClientNotifications,
} from "@/hooks/queries/notifications";
import { cn } from "@/lib/utils";

export function RecentUpdatesCard() {
  const copy = CLIENT_DASHBOARD_COPY;
  const { data: notifications = [] } = useClientNotifications();
  const { markAllRead } = useClientNotificationMutations();
  const updates = notifications.slice(0, 3);

  return (
    <section className="py-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
        <h2 className="text-[11px] font-medium text-ink-faint">
          {copy.recentNotifications}
        </h2>
        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.client.notifications}
            className="text-xs font-semibold text-ink transition-colors hover:text-accent"
          >
            {copy.viewAllNotifications}
          </Link>
          <button
            type="button"
            onClick={() => void markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            {copy.markAllRead}
          </button>
        </div>
      </div>

      <ul className="space-y-3">
        {updates.map((item) => {
          const Icon = getClientDashboardNotificationIcon(item.category);

          return (
            <li key={item.id}>
              <Link
                to={item.href ?? ROUTES.client.notifications}
                className="flex items-center gap-4 rounded-md border border-border bg-panel px-4 py-4 transition-colors hover:bg-paper-dim sm:px-5 sm:py-5"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    item.read ? "bg-paper-dim text-ink-soft" : "bg-accent-tint text-accent",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-ink-soft">{item.message}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-faint">
                  {item.timestamp}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
