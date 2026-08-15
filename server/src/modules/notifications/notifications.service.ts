import { prisma } from "../../lib/prisma.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import {
  formatRelativeTimestamp,
  resolveNotificationGroup,
} from "../../lib/notification-dispatch.js";
import { AppError } from "../../middleware/error-handler.js";

type NotificationMetadata = {
  icon?: string;
  priority?: string;
  actionLabel?: string;
  primaryAction?: { label: string; href?: string; variant?: string };
  secondaryAction?: { label: string; href?: string; variant?: string };
};

const CLIENT_NOTIFICATION_CATEGORIES = new Set([
  "booking",
  "payment",
  "gallery",
  "reminder",
  "general",
]);

function normalizeClientCategory(category: string) {
  return CLIENT_NOTIFICATION_CATEGORIES.has(category) ? category : "general";
}

function readMetadata(value: unknown): NotificationMetadata {
  if (!value || typeof value !== "object") return {};
  return value as NotificationMetadata;
}

export function toApiClientNotification(notification: {
  id: string;
  category: string;
  title: string;
  description: string;
  read: boolean;
  actionHref: string | null;
  metadata: unknown;
  createdAt: Date;
}) {
  const meta = readMetadata(notification.metadata);

  return {
    id: notification.id,
    category: normalizeClientCategory(notification.category),
    title: notification.title,
    message: notification.description,
    timestamp: formatRelativeTimestamp(notification.createdAt),
    read: notification.read,
    href: notification.actionHref ?? undefined,
    actionLabel: meta.actionLabel,
  };
}

export function toApiStudioNotification(notification: {
  id: string;
  category: string;
  title: string;
  description: string;
  read: boolean;
  actionHref: string | null;
  metadata: unknown;
  createdAt: Date;
}) {
  const meta = readMetadata(notification.metadata);

  return {
    id: notification.id,
    group: resolveNotificationGroup(notification.createdAt),
    category: notification.category,
    priority: meta.priority ?? "medium",
    read: notification.read,
    title: notification.title,
    description: notification.description,
    timestamp: formatRelativeTimestamp(notification.createdAt),
    icon: meta.icon ?? "calendar",
    primaryAction: meta.primaryAction ?? {
      label: "View",
      href: notification.actionHref ?? undefined,
      variant: "primary",
    },
    secondaryAction: meta.secondaryAction,
  };
}

async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

export async function listClientNotifications(
  clientUserId: string,
  pagination?: PaginationParams,
) {
  const user = await getClientUser(clientUserId);
  const where = { userId: user.id };

  if (!pagination) {
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return notifications.map(toApiClientNotification);
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return buildPaginatedResult(
    notifications.map(toApiClientNotification),
    total,
    pagination,
  );
}

export async function markClientNotificationRead(
  clientUserId: string,
  notificationId: string,
) {
  const user = await getClientUser(clientUserId);
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: user.id },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });

  return toApiClientNotification(updated);
}

export async function markAllClientNotificationsRead(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return listClientNotifications(clientUserId);
}

export async function listPhotographerNotifications(
  photographerUserId: string,
  pagination?: PaginationParams,
) {
  const where = { userId: photographerUserId };

  if (!pagination) {
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return notifications.map(toApiStudioNotification);
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return buildPaginatedResult(
    notifications.map(toApiStudioNotification),
    total,
    pagination,
  );
}

export async function markPhotographerNotificationRead(
  photographerUserId: string,
  notificationId: string,
) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: photographerUserId },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { read: true },
  });

  return toApiStudioNotification(updated);
}

export async function markAllPhotographerNotificationsRead(
  photographerUserId: string,
) {
  await prisma.notification.updateMany({
    where: { userId: photographerUserId, read: false },
    data: { read: true },
  });
  return listPhotographerNotifications(photographerUserId);
}
