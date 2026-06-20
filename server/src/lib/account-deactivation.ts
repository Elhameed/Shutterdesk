import { prisma } from "./prisma.js";
import { createNotification } from "./notification-dispatch.js";
import { invalidateUserTokens } from "./auth-session.js";
import { AppError } from "../middleware/error-handler.js";

export async function deactivateClientAccount(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const stored =
    user.clientSettings && typeof user.clientSettings === "object"
      ? (user.clientSettings as Record<string, unknown>)
      : {};

  await prisma.user.update({
    where: { id: user.id },
    data: {
      clientSettings: {
        ...stored,
        deactivatedAt: new Date().toISOString(),
      },
    },
  });

  await createNotification({
    userId: user.id,
    category: "account",
    title: "Account deactivation requested",
    description:
      "Your Shutterdesk client account has been deactivated. Contact support if you need to restore access.",
  });

  await invalidateUserTokens(user.id);
}

export async function deactivatePhotographerAccount(photographerUserId: string) {
  const studio = await prisma.studio.findUnique({
    where: { ownerUserId: photographerUserId },
  });

  if (!studio) {
    throw new AppError("Studio not found", 404);
  }

  const stored =
    studio.securitySettings && typeof studio.securitySettings === "object"
      ? (studio.securitySettings as Record<string, unknown>)
      : {};

  await prisma.studio.update({
    where: { id: studio.id },
    data: {
      securitySettings: {
        ...stored,
        deactivatedAt: new Date().toISOString(),
      },
    },
  });

  await createNotification({
    userId: photographerUserId,
    category: "account",
    title: "Studio account deactivation requested",
    description:
      "Your Shutterdesk studio account has been deactivated. Contact support if you need to restore access.",
  });

  await invalidateUserTokens(photographerUserId);
}

export function isUserDeactivated(user: {
  role: string;
  clientSettings: unknown;
  studio?: { securitySettings: unknown } | null;
}) {
  if (user.role === "client") {
    const settings =
      user.clientSettings && typeof user.clientSettings === "object"
        ? (user.clientSettings as Record<string, unknown>)
        : {};
    return typeof settings.deactivatedAt === "string" && settings.deactivatedAt.length > 0;
  }

  if (user.role === "photographer" && user.studio) {
    const settings =
      user.studio.securitySettings && typeof user.studio.securitySettings === "object"
        ? (user.studio.securitySettings as Record<string, unknown>)
        : {};
    return typeof settings.deactivatedAt === "string" && settings.deactivatedAt.length > 0;
  }

  return false;
}
