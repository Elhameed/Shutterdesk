import { randomInt } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import {
  isGalleryExpired,
  readStoredGallerySettings,
  resolveGalleryAccessPin,
  resolveGalleryClientAccess,
  type GalleryClientAccessOptions,
} from "../../domain/gallery-settings.js";
import { syncBookingProgressForGallery } from "../../domain/sync-booking-gallery-progress.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  toApiGallery,
  toApiGalleryDetailMeta,
  toApiGalleryPhoto,
} from "./galleries.mapper.js";

export const galleryBookingInclude = {
  booking: { select: { id: true } },
} as const;

export async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

/**
 * `Math.random` is not a CSPRNG — an access PIN generated from it is
 * predictable given enough samples, which defeats the point of the PIN.
 */

export function generateGalleryAccessPin() {
  return String(randomInt(1000, 10_000));
}

export function normalizeAssetKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("http") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return trimmed.replace(/^\//, "");
}

export async function linkGalleryToBooking(galleryId: string, bookingId: string, studioId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, studioId },
  });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Detaching every existing link and attaching the new one must be atomic: a
  // failure between the two leaves the gallery attached to no booking at all,
  // having just been detached from the one it had.
  await prisma.$transaction([
    prisma.booking.updateMany({
      where: { galleryId },
      data: { galleryId: null },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { galleryId },
    }),
  ]);

  await syncBookingProgressForGallery(galleryId);
}

export async function unlinkGalleryFromBookings(galleryId: string) {
  await prisma.booking.updateMany({
    where: { galleryId },
    data: { galleryId: null },
  });
}

export function galleryPhotoStatsUpdate(
  galleryId: string,
  photos: Array<{ assetKey: string }>,
) {
  const photoCount = photos.length;

  return prisma.gallery.update({
    where: { id: galleryId },
    data: {
      photoCount,
      coverAssetKey: photos[0]?.assetKey ?? null,
      storageUsedGb: Math.min(49.5, Number((photoCount * 0.025).toFixed(1))),
    },
  });
}

export async function syncGalleryPhotoStats(
  galleryId: string,
  photos: Array<{ assetKey: string }>,
) {
  await galleryPhotoStatsUpdate(galleryId, photos);
}

export function buildGalleryDetailResponse(
  gallery: Awaited<ReturnType<typeof getOwnedGalleryOrThrow>>,
) {
  return {
    gallery: toApiGallery(gallery),
    meta: toApiGalleryDetailMeta(gallery, gallery.photos, "photographer"),
    photos: gallery.photos.map(toApiGalleryPhoto),
  };
}

export async function findAuthorizedClientGallery(
  clientUserId: string,
  galleryId: string,
) {
  const user = await getClientUser(clientUserId);
  const gallery = await prisma.gallery.findFirst({
    where: {
      id: galleryId,
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
      status: "published",
      workflowStatus: { in: ["ready", "delivered"] },
    },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return gallery ? { user, gallery } : null;
}

export function assertClientGalleryAccess(
  gallery: NonNullable<Awaited<ReturnType<typeof findAuthorizedClientGallery>>>["gallery"],
  options: GalleryClientAccessOptions = {},
) {
  const settings = readStoredGallerySettings(gallery);

  if (isGalleryExpired(settings)) {
    throw new AppError("This gallery link has expired.", 403);
  }

  const access = resolveGalleryClientAccess(gallery, options);

  if (access.pinRequired && !access.pinVerified) {
    if (!resolveGalleryAccessPin(gallery, settings)) {
      throw new AppError(
        "This gallery requires a PIN, but your photographer has not configured one yet.",
        403,
      );
    }

    throw new AppError("Enter the correct gallery access PIN to continue.", 403);
  }
}

export async function getOwnedGalleryOrThrow(photographerUserId: string, galleryId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, studioId: studio.id },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!gallery) {
    throw new AppError("Gallery not found", 404);
  }

  return gallery;
}

export function resolveGalleryNotificationCopy(gallery: {
  title: string;
  photoCount: number;
  workflowStatus: string;
}) {
  if (gallery.workflowStatus === "delivered") {
    return {
      title: "Gallery delivered",
      description: `${gallery.title} · ${gallery.photoCount} photos ready to view.`,
    };
  }

  if (gallery.workflowStatus === "ready") {
    return {
      title: "Gallery ready for review",
      description: `${gallery.title} proofs are ready for your review.`,
    };
  }

  return {
    title: "Gallery update",
    description: `Your photographer shared an update for ${gallery.title}.`,
  };
}

export async function getGalleryIdForBooking(
  clientUserId: string,
  bookingId: string,
) {
  const user = await getClientUser(clientUserId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
    },
  });

  return booking?.galleryId ?? undefined;
}
