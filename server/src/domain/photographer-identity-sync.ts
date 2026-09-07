import { prisma } from "../lib/prisma.js";

/**
 * Propagate a studio rename to the places that copied the old name.
 *
 * `PaymentRecord.studioName` is the only denormalized copy of a studio's
 * identity in the schema — a photographer's own name and avatar live on `User`
 * and `Studio` and are read through relations, so there is nothing to sync for
 * them.
 *
 * This function used to accept `fullName` and `avatarUrl` alongside
 * `studioName` and silently ignore both. Callers passed them expecting a sync
 * that never happened. The signature now says what it does.
 */
export async function syncStudioNameAcrossRecords(
  photographerUserId: string,
  studioName: string,
) {
  const trimmed = studioName.trim();
  if (!trimmed) {
    return;
  }

  const studio = await prisma.studio.findUnique({
    where: { ownerUserId: photographerUserId },
    select: { id: true },
  });

  if (!studio) {
    return;
  }

  await prisma.paymentRecord.updateMany({
    where: { studioId: studio.id },
    data: { studioName: trimmed },
  });
}
