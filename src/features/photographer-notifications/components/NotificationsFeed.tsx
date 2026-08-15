import {
  NOTIFICATIONS_COPY,
  NOTIFICATION_GROUP_ORDER,
  type NotificationGroup,
} from "@/constants/photographer-notifications";
import { NotificationCard } from "@/features/photographer-notifications/components/NotificationCard";
import type { StudioNotification } from "@/types/domains/notification";

type NotificationsFeedProps = {
  notifications: StudioNotification[];
  onMarkRead: (id: string) => void;
};

export function NotificationsFeed({
  notifications,
  onMarkRead,
}: NotificationsFeedProps) {
  const copy = NOTIFICATIONS_COPY;

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center text-sm text-muted">
        {copy.empty}
      </div>
    );
  }

  const grouped = NOTIFICATION_GROUP_ORDER.reduce<
    Record<NotificationGroup, StudioNotification[]>
  >(
    (acc, group) => {
      acc[group] = notifications.filter((item) => item.group === group);
      return acc;
    },
    { today: [], yesterday: [], earlier: [] },
  );

  return (
    <div className="space-y-8">
      {NOTIFICATION_GROUP_ORDER.map((group) => {
        const items = grouped[group];
        if (items.length === 0) return null;

        return (
          <section key={group}>
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-wider text-muted uppercase">
                {copy.groups[group]}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <div className="space-y-3">
              {items.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
