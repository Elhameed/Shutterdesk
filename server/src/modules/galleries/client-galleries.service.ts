import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { appendGalleryActivity } from "../../domain/gallery-activity.js";
import {
  isGalleryExpired,
  isGalleryPinProtected,
  readStoredGallerySettings,
  resolveDownloadEnabled,
  resolveGalleryClientAccess,
  verifyGalleryAccessPin,
  type GalleryClientAccessOptions,
} from "../../domain/gallery-settings.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  toApiGallery,
  toApiGalleryDetailMeta,
  toApiGalleryPhoto,
} from "./galleries.mapper.js";
import {
  assertClientGalleryAccess,
  findAuthorizedClientGallery,
  galleryBookingInclude,
  getClientUser,
} from "./galleries.shared.js";

export async function listClientGalleries(clientUserId: string) {
  const user = await getClientUser(clientUserId);
  const galleries = await prisma.gallery.findMany({
    where: {
      OR: [
        { clientUserId: user.id },
        { clientEmail: user.email.toLowerCase() },
      ],
      status: "published",
      workflowStatus: { in: ["ready", "delivered"] },
    },
    include: galleryBookingInclude,
    orderBy: { uploadedAt: "desc" },
  });

  return galleries.map(toApiGallery);
}

export async function getClientGalleryDetail(
  clientUserId: string,
  galleryId: string,
  options: GalleryClientAccessOptions = {},
) {
  const authorized = await findAuthorizedClientGallery(clientUserId, galleryId);
  if (!authorized) return null;

  const { user, gallery } = authorized;
  const access = resolveGalleryClientAccess(gallery, options);
  const canViewPhotos = !access.expired && (!access.pinRequired || access.pinVerified);

  if (access.expired) {
    return {
      gallery: toApiGallery(gallery),
      meta: toApiGalleryDetailMeta(gallery, "client", access),
      photos: [],
    };
  }

  const activities = canViewPhotos
    ? appendGalleryActivity(gallery.activities, {
        type: "view",
        description: `${user.fullName} viewed the gallery.`,
      })
    : gallery.activities;

  const updated = await prisma.gallery.update({
    where: { id: gallery.id },
    data: canViewPhotos
      ? {
          isNew: false,
          // Atomic: a read-modify-write loses counts when two viewers
          // open the gallery at the same time.
          views: { increment: 1 },
          activities: activities as Prisma.InputJsonValue,
        }
      : { activities: activities as Prisma.InputJsonValue },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return {
    gallery: toApiGallery({ ...updated, isNew: canViewPhotos ? false : updated.isNew }),
    meta: toApiGalleryDetailMeta(updated, "client", access),
    photos: canViewPhotos ? gallery.photos.map(toApiGalleryPhoto) : [],
  };
}

export async function verifyClientGalleryPin(
  clientUserId: string,
  galleryId: string,
  pin: string,
) {
  const authorized = await findAuthorizedClientGallery(clientUserId, galleryId);
  if (!authorized) {
    throw new AppError("Gallery not found", 404);
  }

  const { gallery } = authorized;
  const settings = readStoredGallerySettings(gallery);

  if (isGalleryExpired(settings)) {
    throw new AppError("This gallery link has expired.", 403);
  }

  if (!isGalleryPinProtected(settings)) {
    return { verified: true };
  }

  if (!verifyGalleryAccessPin(gallery, pin)) {
    throw new AppError("Incorrect gallery PIN. Please try again.", 400);
  }

  return { verified: true };
}

export async function recordClientGalleryDownload(
  clientUserId: string,
  galleryId: string,
  options: GalleryClientAccessOptions = {},
) {
  const authorized = await findAuthorizedClientGallery(clientUserId, galleryId);
  if (!authorized) {
    throw new AppError("Gallery not found or not delivered", 404);
  }

  const { gallery } = authorized;
  if (gallery.workflowStatus !== "delivered") {
    throw new AppError("Gallery not found or not delivered", 404);
  }

  assertClientGalleryAccess(gallery, options);

  const settings = readStoredGallerySettings(gallery);
  if (!resolveDownloadEnabled(gallery, settings)) {
    throw new AppError("Downloads are not enabled for this gallery", 403);
  }

  await prisma.gallery.update({
    where: { id: gallery.id },
    data: { downloads: { increment: 1 } },
  });

  return {
    photos: gallery.photos.map((photo) => ({
      id: photo.id,
      assetKey: photo.assetKey,
      alt: photo.alt,
    })),
  };
}

export async function getClientPhotoDownloadUrl(
  clientUserId: string,
  galleryId: string,
  photoId: string,
  options: GalleryClientAccessOptions = {},
) {
  const authorized = await findAuthorizedClientGallery(clientUserId, galleryId);
  if (!authorized) {
    throw new AppError("Gallery not found or not delivered", 404);
  }

  const { gallery } = authorized;
  if (gallery.workflowStatus !== "delivered") {
    throw new AppError("Gallery not found or not delivered", 404);
  }

  assertClientGalleryAccess(gallery, options);

  const photo = gallery.photos.find((item) => item.id === photoId);
  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  const settings = readStoredGallerySettings(gallery);
  if (!resolveDownloadEnabled(gallery, settings)) {
    throw new AppError("Downloads are not enabled for this gallery", 403);
  }

  await prisma.gallery.update({
    where: { id: gallery.id },
    data: { downloads: { increment: 1 } },
  });

  return {
    assetKey: photo.assetKey,
    alt: photo.alt,
  };
}
