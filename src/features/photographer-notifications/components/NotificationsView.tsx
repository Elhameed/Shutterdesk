import { useMemo, useState } from "react";
import {
  DEFAULT_NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationStatusFilter,
} from "@/constants/photographer-notifications";
import { NotificationsFeed } from "@/features/photographer-notifications/components/NotificationsFeed";
import { NotificationsHeader } from "@/features/photographer-notifications/components/NotificationsHeader";
import { NotificationsSidebar } from "@/features/photographer-notifications/components/NotificationsSidebar";
import {
  filterNotifications,
  getNotificationCounts,
} from "@/features/photographer-notifications/utils/notification-filters";
import {
  usePhotographerNotificationMutations,
  usePhotographerNotifications,
} from "@/hooks/queries/notifications";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { NotificationsPageSkeleton } from "@/components/skeletons";

export function NotificationsView() {
  const [activeStatus, setActiveStatus] =
    useState<NotificationStatusFilter>("all");
  const [categories, setCategories] = useState(DEFAULT_NOTIFICATION_CATEGORIES);
  const { data: notifications = [], isLoading } = usePhotographerNotifications();
  const showSkeleton = useDelayedLoading(isLoading);
  const { markAllRead, markRead } = usePhotographerNotificationMutations();

  const counts = useMemo(
    () => getNotificationCounts(notifications),
    [notifications],
  );

  const visibleNotifications = useMemo(
    () => filterNotifications(notifications, activeStatus, categories),
    [notifications, activeStatus, categories],
  );

  const handleCategoryChange = (
    category: NotificationCategory,
    checked: boolean,
  ) => {
    setCategories((current) => ({ ...current, [category]: checked }));
  };

  if (showSkeleton) {
    return <NotificationsPageSkeleton withSidebar />;
  }

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <NotificationsHeader
        onMarkAllRead={() => void markAllRead.mutate()}
        isMarkingAllRead={markAllRead.isPending}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <NotificationsSidebar
          activeStatus={activeStatus}
          counts={counts}
          categories={categories}
          onStatusChange={setActiveStatus}
          onCategoryChange={handleCategoryChange}
        />

        <NotificationsFeed
          notifications={visibleNotifications}
          onMarkRead={(id) => void markRead.mutate(id)}
        />
      </div>
    </div>
  );
}
