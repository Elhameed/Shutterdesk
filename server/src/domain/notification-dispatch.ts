import { prisma } from "../lib/prisma.js";

// Re-exported so notification call sites keep one import; the implementation
// now lives with the other date formatters.
export { formatRelativeTimestamp } from "../format/date-format.js";

type NotificationMetadata = {
  icon?: string;
  priority?: string;
  group?: string;
  actionLabel?: string;
  primaryAction?: { label: string; href?: string; variant?: string };
  secondaryAction?: { label: string; href?: string; variant?: string };
};

type CreateNotificationInput = {
  userId: string;
  category: string;
  title: string;
  description: string;
  actionHref?: string;
  metadata?: NotificationMetadata;
};

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      category: input.category,
      title: input.title,
      description: input.description,
      actionHref: input.actionHref ?? null,
      metadata: input.metadata ?? {},
    },
  });
}

export async function findClientUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return user?.role === "client" ? user.id : null;
}

export async function findClientUserForBooking(booking: {
  clientUserId?: string | null;
  clientEmail: string;
}) {
  if (booking.clientUserId) {
    const linkedUser = await prisma.user.findUnique({
      where: { id: booking.clientUserId },
    });
    if (linkedUser?.role === "client") {
      return linkedUser;
    }
  }

  return prisma.user.findFirst({
    where: {
      email: booking.clientEmail.toLowerCase(),
      role: "client",
    },
  });
}

export async function findStudioOwnerUserId(studioId: string) {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { ownerUserId: true },
  });
  return studio?.ownerUserId ?? null;
}

export function resolveNotificationGroup(date: Date): "today" | "yesterday" | "earlier" {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  return "earlier";
}
