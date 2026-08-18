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
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.recentNotifications}
        </h2>
        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.client.notifications}
            className="text-xs font-semibold text-charcoal transition-colors hover:text-gold"
          >
            {copy.viewAllNotifications}
          </Link>
          <button
            type="button"
            onClick={() => void markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
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
                className="flex items-center gap-4 rounded-xl border border-border bg-white px-4 py-4 shadow-card transition-colors hover:bg-gray-50 sm:px-5 sm:py-5"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    item.read ? "bg-gray-100 text-muted" : "bg-gold-light text-gold",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-charcoal">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted">{item.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-light">
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
