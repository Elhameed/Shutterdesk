export type NotificationStatusFilter = "all" | "unread" | "read";

export type NotificationCategory =
  | "booking"
  | "payment"
  | "gallery"
  | "client"
  | "system";

export type NotificationPriority = "high" | "medium" | "low";

export type NotificationGroup = "today" | "yesterday" | "earlier";

export const NOTIFICATIONS_COPY = {
  title: "Notifications",
  subtitle: "Stay informed about your studio activity and client requests.",
  markAllRead: "Mark all read",
  notificationSettings: "Notification settings",
  status: "Status",
  categories: "Categories",
  statusFilters: {
    all: "All",
    unread: "Unread",
    read: "Read",
  },
  categoryFilters: {
    booking: "Booking updates",
    payment: "Payment updates",
    gallery: "Gallery updates",
    client: "Client activity",
    system: "System notifications",
  },
  groups: {
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier this week",
  },
  categoryTags: {
    booking: "Booking",
    payment: "Payment",
    gallery: "Gallery",
    client: "Client",
    system: "System",
  },
  priorityTags: {
    high: "High priority",
    medium: "Medium",
    low: "Low",
  },
  empty: "No notifications match your filters.",
} as const;

export const DEFAULT_NOTIFICATION_CATEGORIES: Record<
  NotificationCategory,
  boolean
> = {
  booking: true,
  payment: true,
  gallery: true,
  client: false,
  system: false,
};

export const NOTIFICATION_GROUP_ORDER: NotificationGroup[] = [
  "today",
  "yesterday",
  "earlier",
];
