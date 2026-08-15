import type {
  ClientNotification,
  StudioNotification,
} from "@/types/domains/notification";

export type ToastVariant = "success" | "info" | "warning" | "error";

function matchesAny(text: string, patterns: string[]) {
  const normalized = text.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function resolveToastVariant(input: {
  category: string;
  title: string;
  description: string;
  priority?: string;
}): ToastVariant {
  const combined = `${input.title} ${input.description}`;

  if (
    matchesAny(combined, [
      "rejected",
      "declined",
      "cancelled",
      "canceled",
      "failed",
      "could not",
    ])
  ) {
    return "error";
  }

  if (
    matchesAny(combined, [
      "confirmed",
      "approved",
      "verified",
      "delivered",
      "completed",
      "published",
    ])
  ) {
    return "success";
  }

  if (
    matchesAny(combined, [
      "pending",
      "awaiting",
      "submitted",
      "reminder",
      "due",
    ]) ||
    input.priority === "high"
  ) {
    return "warning";
  }

  if (input.category === "payment" || input.category === "booking") {
    return "info";
  }

  return "info";
}

export function studioNotificationToToast(notification: StudioNotification) {
  return {
    title: notification.title,
    description: notification.description,
    variant: resolveToastVariant({
      category: notification.category,
      title: notification.title,
      description: notification.description,
      priority: notification.priority,
    }),
    href: notification.primaryAction.href,
    actionLabel: notification.primaryAction.label,
  };
}

export function clientNotificationToToast(notification: ClientNotification) {
  return {
    title: notification.title,
    description: notification.message,
    variant: resolveToastVariant({
      category: notification.category,
      title: notification.title,
      description: notification.message,
    }),
    href: notification.href,
    actionLabel:
      notification.actionLabel === "viewDetails" ? "View details" : undefined,
  };
}
