import { prisma } from "./prisma.js";

type ClientProfileSync = {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
};

export async function syncClientProfileAcrossRecords(
  clientUserId: string,
  updates: ClientProfileSync,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user) {
    return;
  }

  const email = user.email.toLowerCase();
  const clientFilter = {
    OR: [{ linkedUserId: clientUserId }, { email }],
  };
  const bookingFilter = {
    OR: [{ clientUserId }, { clientEmail: email }],
  };

  const operations = [];

  const studioClientData: Record<string, string> = {};
  if (updates.fullName) {
    studioClientData.name = updates.fullName;
  }
  if (updates.phone) {
    studioClientData.phone = updates.phone;
  }
  if (updates.address) {
    studioClientData.location = updates.address;
  }
  if (updates.avatarUrl) {
    studioClientData.avatarAssetKey = updates.avatarUrl;
  }

  if (Object.keys(studioClientData).length > 0) {
    operations.push(
      prisma.studioClient.updateMany({
        where: clientFilter,
        data: studioClientData,
      }),
    );
  }

  const bookingData: Record<string, string> = {};
  if (updates.fullName) {
    bookingData.clientName = updates.fullName;
  }
  if (updates.avatarUrl) {
    bookingData.clientAvatarAssetKey = updates.avatarUrl;
  }

  if (Object.keys(bookingData).length > 0) {
    operations.push(
      prisma.booking.updateMany({
        where: bookingFilter,
        data: bookingData,
      }),
    );
  }

  const verificationData: Record<string, string> = {};
  if (updates.fullName) {
    verificationData.clientName = updates.fullName;
  }
  if (updates.avatarUrl) {
    verificationData.clientAvatarAssetKey = updates.avatarUrl;
  }

  if (Object.keys(verificationData).length > 0) {
    operations.push(
      prisma.paymentVerification.updateMany({
        where: { clientEmail: email },
        data: verificationData,
      }),
    );
  }

  if (updates.fullName) {
    operations.push(
      prisma.gallery.updateMany({
        where: {
          OR: [{ clientUserId }, { clientEmail: email }],
        },
        data: { clientName: updates.fullName },
      }),
    );
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }
}
