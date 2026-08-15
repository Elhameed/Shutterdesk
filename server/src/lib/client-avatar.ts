import type { Booking, StudioClient, User } from "@prisma/client";
import { prisma } from "./prisma.js";

type AvatarSources = {
  userAvatarUrl?: string | null;
  studioClientAvatar?: string | null;
  bookingAvatar?: string | null;
};

export function resolveClientAvatarKey(sources: AvatarSources): string | null {
  for (const value of [
    sources.userAvatarUrl,
    sources.studioClientAvatar,
    sources.bookingAvatar,
  ]) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export type StudioClientWithLinkedUser = StudioClient & {
  linkedUser?: Pick<User, "avatarUrl"> | null;
};

export type BookingWithClientAvatars = Booking & {
  client?: StudioClientWithLinkedUser | null;
  clientUser?: Pick<User, "avatarUrl"> | null;
};

export function resolveStudioClientAvatar(
  client: StudioClientWithLinkedUser,
): string | null {
  return resolveClientAvatarKey({
    userAvatarUrl: client.linkedUser?.avatarUrl,
    studioClientAvatar: client.avatarAssetKey,
  });
}

export function resolveBookingClientAvatar(
  booking: BookingWithClientAvatars,
): string | null {
  return resolveClientAvatarKey({
    userAvatarUrl:
      booking.clientUser?.avatarUrl ?? booking.client?.linkedUser?.avatarUrl,
    studioClientAvatar: booking.client?.avatarAssetKey,
    bookingAvatar: booking.clientAvatarAssetKey,
  });
}

const bookingAvatarInclude = {
  client: { include: { linkedUser: { select: { avatarUrl: true } } } },
  clientUser: { select: { avatarUrl: true } },
} as const;

export { bookingAvatarInclude };

export async function syncClientAvatarAcrossRecords(
  clientUserId: string,
  avatarUrl: string,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user) return;

  const email = user.email.toLowerCase();

  await prisma.$transaction([
    prisma.studioClient.updateMany({
      where: {
        OR: [{ linkedUserId: clientUserId }, { email }],
      },
      data: { avatarAssetKey: avatarUrl },
    }),
    prisma.booking.updateMany({
      where: {
        OR: [{ clientUserId }, { clientEmail: email }],
      },
      data: { clientAvatarAssetKey: avatarUrl },
    }),
    prisma.paymentVerification.updateMany({
      where: { clientEmail: email },
      data: { clientAvatarAssetKey: avatarUrl },
    }),
  ]);
}
