import { prisma } from "./prisma.js";

type PhotographerIdentitySync = {
  fullName?: string;
  avatarUrl?: string;
  studioName?: string;
};

export async function syncPhotographerIdentityAcrossRecords(
  photographerUserId: string,
  updates: PhotographerIdentitySync,
) {
  const studio = await prisma.studio.findUnique({
    where: { ownerUserId: photographerUserId },
  });

  if (!studio) {
    return;
  }

  if (updates.studioName) {
    await prisma.paymentRecord.updateMany({
      where: { studioId: studio.id },
      data: { studioName: updates.studioName },
    });
  }
}
