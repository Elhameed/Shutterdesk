import { prisma } from "../../lib/prisma.js";
import {
  buildPhotographerActivityRecords,
  filterPhotographerActivities,
  paginatePhotographerActivities,
  toPhotographerActivityItem,
  type PhotographerActivityType,
} from "../../lib/photographer-activity.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";

function resolveSinceDate(range?: string) {
  if (!range || range === "all") {
    return undefined;
  }

  const now = new Date();
  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return undefined;
}

async function loadPhotographerActivityRecords(studioId: string) {
  const [bookings, verifications, galleries, clients, services] = await Promise.all([
    prisma.booking.findMany({
      where: { studioId },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        clientName: true,
        packageName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.paymentVerification.findMany({
      where: { studioId },
      orderBy: { submittedAt: "desc" },
      take: 80,
      select: {
        id: true,
        bookingId: true,
        clientName: true,
        bookingTitle: true,
        transactionId: true,
        status: true,
        submittedAt: true,
        verifiedAt: true,
        updatedAt: true,
      },
    }),
    prisma.gallery.findMany({
      where: { studioId },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        clientName: true,
        workflowStatus: true,
        uploadedAt: true,
        updatedAt: true,
      },
    }),
    prisma.studioClient.findMany({
      where: { studioId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    }),
    prisma.servicePackage.findMany({
      where: { studioId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return buildPhotographerActivityRecords({
    bookings,
    verifications,
    galleries,
    clients,
    services,
  });
}

export async function listPhotographerActivities(
  photographerUserId: string,
  pagination: PaginationParams,
  filters: {
    type?: PhotographerActivityType;
    range?: string;
  } = {},
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const records = await loadPhotographerActivityRecords(studio.id);
  const filtered = filterPhotographerActivities(records, {
    type: filters.type,
    since: resolveSinceDate(filters.range),
  });
  const pageItems = paginatePhotographerActivities(
    filtered,
    pagination.skip,
    pagination.limit,
  );

  return buildPaginatedResult(
    pageItems.map((item) => toPhotographerActivityItem(item)),
    filtered.length,
    pagination,
  );
}

export async function getRecentPhotographerActivities(
  photographerUserId: string,
  limit = 3,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const records = await loadPhotographerActivityRecords(studio.id);

  return records.slice(0, limit).map((item) => toPhotographerActivityItem(item));
}
