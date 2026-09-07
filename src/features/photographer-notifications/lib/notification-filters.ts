import type {
  NotificationCategory,
  NotificationStatusFilter,
} from "@/constants/photographer-notifications";
import type { StudioNotification } from "@/types/domains/notification";

export function getNotificationCounts(notifications: StudioNotification[]) {
  return {
    all: notifications.length,
    unread: notifications.filter((item) => !item.read).length,
    read: notifications.filter((item) => item.read).length,
  };
}

export function filterNotifications(
  notifications: StudioNotification[],
  status: NotificationStatusFilter,
  categories: Record<NotificationCategory, boolean>,
): StudioNotification[] {
  return notifications.filter((notification) => {
    const matchesStatus =
      status === "all" ||
      (status === "unread" && !notification.read) ||
      (status === "read" && notification.read);

    const matchesCategory = categories[notification.category];

    return matchesStatus && matchesCategory;
  });
}
