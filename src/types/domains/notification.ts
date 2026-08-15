import type {
  NotificationCategory,
  NotificationGroup,
  NotificationPriority,
} from "@/constants/photographer-notifications";

export type NotificationIconType =
  | "calendar"
  | "payment"
  | "gallery"
  | "client"
  | "alert";

export type NotificationAction = {
  label: string;
  href?: string;
  variant?: "primary" | "outline" | "link";
};

export type StudioNotification = {
  id: string;
  group: NotificationGroup;
  category: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  title: string;
  description: string;
  timestamp: string;
  icon: NotificationIconType;
  primaryAction: NotificationAction;
  secondaryAction?: NotificationAction;
};

export type ClientNotificationCategory =
  | "booking"
  | "payment"
  | "gallery"
  | "reminder"
  | "general";

export type ClientNotification = {
  id: string;
  category: ClientNotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  href?: string;
  actionLabel?: "viewDetails" | "getStarted";
};
