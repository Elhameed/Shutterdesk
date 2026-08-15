import { prisma } from "./prisma.js";
import { isUserDeactivated } from "./account-deactivation.js";

export async function invalidateUserTokens(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });
}

export async function loadAuthUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      tokenVersion: true,
      clientSettings: true,
      studio: {
        select: {
          securitySettings: true,
        },
      },
    },
  });

  if (!user || isUserDeactivated(user)) {
    return null;
  }

  return user;
}
