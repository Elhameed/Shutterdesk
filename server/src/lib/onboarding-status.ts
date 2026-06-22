import type { User } from "@prisma/client";
import { prisma } from "./prisma.js";

export async function resolveNeedsOnboarding(user: User): Promise<boolean> {
  if (user.role === "photographer") {
    const studio = await prisma.studio.findUnique({
      where: { ownerUserId: user.id },
      select: { id: true },
    });
    return !studio;
  }

  const settings =
    user.clientSettings && typeof user.clientSettings === "object"
      ? (user.clientSettings as {
          skipped?: boolean;
          address?: string;
          interests?: string[];
        })
      : null;

  if (settings?.skipped === true) {
    return false;
  }

  return (
    !user.phone?.trim() ||
    !settings?.address?.trim() ||
    !Array.isArray(settings.interests) ||
    settings.interests.length === 0
  );
}
