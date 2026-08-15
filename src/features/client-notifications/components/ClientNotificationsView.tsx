import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { Button } from "@/components/ui/button";
import { CLIENT_NOTIFICATIONS_COPY } from "@/constants/client-notifications";
import { ClientNotificationCard } from "@/features/client-notifications/components/ClientNotificationCard";
import {
  useClientNotificationMutations,
  useClientNotifications,
} from "@/hooks/queries/notifications";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { NotificationsFeedSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

type NotificationFilter = keyof typeof CLIENT_NOTIFICATIONS_COPY.filters;

export function ClientNotificationsView() {
  const copy = CLIENT_NOTIFICATIONS_COPY;
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const { data: notifications = [], isLoading } = useClientNotifications();
  const showSkeleton = useDelayedLoading(isLoading);
  const { markAllRead, markRead } = useClientNotificationMutations();

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.read);
    }
    return notifications;
  }, [filter, notifications]);

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="shadow-card"
            onClick={() => void markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="size-4" aria-hidden />
            {copy.markAllRead}
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(copy.filters) as NotificationFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              filter === key
                ? "bg-charcoal text-white"
                : "bg-white text-muted ring-1 ring-border hover:text-charcoal",
            )}
          >
            {copy.filters[key]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {showSkeleton ? (
          <NotificationsFeedSkeleton rows={5} />
        ) : isLoading ? null : filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
            {copy.empty}
          </p>
        ) : (
          filtered.map((item) => (
            <ClientNotificationCard
              key={item.id}
              notification={item}
              onMarkRead={(id) => void markRead.mutate(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
