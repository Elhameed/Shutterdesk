import type { GalleryCategory } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { createNotification, findClientUserIdByEmail } from "../../domain/notification-dispatch.js";
import { appendGalleryActivity } from "../../domain/gallery-activity.js";
import { assertGalleryReleaseAllowed } from "../../domain/gallery-release.js";
import {
  isGalleryStatusLocked,
  mergeGallerySettings,
  readStoredGallerySettings,
  resolveDownloadEnabled,
} from "../../domain/gallery-settings.js";
import { cloudinaryThumbnailUrl } from "../../lib/cloudinary.js";
import { syncBookingProgressForGallery } from "../../domain/sync-booking-gallery-progress.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { readStudioGalleryDefaults } from "../settings/settings.service.js";
import {
  buildPaginatedResult,
  type PaginationParams,
} from "../../lib/pagination.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  mapStatusSegmentToWorkflow,
  toApiGallery,
  toApiGalleryDetailMeta,
  toApiGalleryPhoto,
} from "./galleries.mapper.js";
import {
  buildGalleryDetailResponse,
  galleryBookingInclude,
  galleryPhotoStatsUpdate,
  generateGalleryAccessPin,
  getOwnedGalleryOrThrow,
  linkGalleryToBooking,
  normalizeAssetKey,
  resolveGalleryNotificationCopy,
  syncGalleryPhotoStats,
  unlinkGalleryFromBookings,
} from "./galleries.shared.js";

type CreateGalleryInput = {
  title: string;
  description?: string;
  category: GalleryCategory;
  clientId: string;
  bookingId?: string;
  visibility?: string;
  allowDownloads?: boolean;
  allowFavorites?: boolean;
  socialSharing?: boolean;
  statusSegment?: "draft" | "editing" | "ready";
  coverAssetKey?: string;
  expirationDate?: string;
  slug?: string;
  showPhotographerCredit?: boolean;
  emailNotifications?: boolean;
  accessPin?: string;
};

type UpdateGalleryInput = Partial<CreateGalleryInput>;

type UploadPhotoInput = {
  assetKey: string;
  thumbnailAssetKey?: string;
  alt?: string;
};

export async function listPhotographerGalleries(
  photographerUserId: string,
  pagination?: PaginationParams,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const where = { studioId: studio.id };
  const query = {
    where,
    include: galleryBookingInclude,
    orderBy: { uploadedAt: "desc" as const },
  };

  if (!pagination) {
    const galleries = await prisma.gallery.findMany(query);
    return galleries.map(toApiGallery);
  }

  const [galleries, total] = await Promise.all([
    prisma.gallery.findMany({
      ...query,
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.gallery.count({ where }),
  ]);

  return buildPaginatedResult(galleries.map(toApiGallery), total, pagination);
}

export async function getPhotographerGalleryDetail(
  photographerUserId: string,
  galleryId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, studioId: studio.id },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!gallery) return null;

  return {
    gallery: toApiGallery(gallery),
    meta: toApiGalleryDetailMeta(gallery),
    photos: gallery.photos.map(toApiGalleryPhoto),
  };
}

export async function createPhotographerGallery(
  photographerUserId: string,
  input: CreateGalleryInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const client = await prisma.studioClient.findFirst({
    where: { id: input.clientId, studioId: studio.id },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  if (input.bookingId) {
    const booking = await prisma.booking.findFirst({
      where: { id: input.bookingId, studioId: studio.id },
    });
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    assertGalleryReleaseAllowed(booking);
  }

  const mapped = mapStatusSegmentToWorkflow(input.statusSegment ?? "draft");
  const coverAssetKey = input.coverAssetKey
    ? normalizeAssetKey(input.coverAssetKey)
    : "landing/gallery/wedding/gallery-wedding-couple";

  const galleryDefaults = readStudioGalleryDefaults(studio);

  const explicitVisibility =
    input.visibility === "public" ||
    input.visibility === "private" ||
    input.visibility === "password"
      ? input.visibility
      : undefined;

  let visibility = explicitVisibility ?? "private";
  let accessPin = input.accessPin;

  if (!explicitVisibility && galleryDefaults.passwordProtection) {
    visibility = "password";
    if (!accessPin) {
      accessPin = generateGalleryAccessPin();
    }
  }

  const allowDownloads =
    input.allowDownloads !== undefined
      ? input.allowDownloads
      : galleryDefaults.allowDownloads;

  const initialSettings = {
    visibility,
    allowSharing: input.socialSharing ?? false,
    allowFavorites: input.allowFavorites ?? true,
    allowDownloads,
    showPhotographerCredit: input.showPhotographerCredit ?? true,
    emailNotifications: input.emailNotifications ?? true,
    expirationDate: input.expirationDate?.trim() || null,
    slug: input.slug ?? "",
    ...(accessPin ? { accessPin } : {}),
  };

  const gallery = await prisma.gallery.create({
    data: {
      studioId: studio.id,
      clientId: client.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      status: mapped.status,
      workflowStatus: mapped.workflowStatus,
      clientName: client.name,
      clientEmail: client.email,
      coverAssetKey,
      settings: initialSettings,
      delivery: {
        deliveryNotes: "Gallery created. Upload photos to begin delivery workflow.",
        watermarkGridView: galleryDefaults.watermarkGridView,
        watermarkRemoveOnPaid: galleryDefaults.watermarkRemoveOnPaid,
        allowClientDisableWatermark: galleryDefaults.allowClientDisableWatermark,
        ...(accessPin ? { accessPin } : {}),
        ...(input.expirationDate
          ? { expiresAt: input.expirationDate }
          : {}),
      },
      activities: [],
      storageTotalGb: 50,
    },
    include: galleryBookingInclude,
  });

  await syncBookingProgressForGallery(gallery.id);

  if (input.bookingId) {
    await linkGalleryToBooking(gallery.id, input.bookingId, studio.id);
    const refreshed = await prisma.gallery.findUniqueOrThrow({
      where: { id: gallery.id },
      include: galleryBookingInclude,
    });
    return toApiGallery(refreshed);
  }

  return toApiGallery(gallery);
}

export async function updatePhotographerGallery(
  photographerUserId: string,
  galleryId: string,
  input: UpdateGalleryInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const existing = await prisma.gallery.findFirst({
    where: { id: galleryId, studioId: studio.id },
  });

  if (!existing) {
    throw new AppError("Gallery not found", 404);
  }

  const mapped =
    input.statusSegment && !isGalleryStatusLocked(existing)
      ? mapStatusSegmentToWorkflow(input.statusSegment)
      : null;

  const mergedSettings = mergeGallerySettings(existing, {
    visibility:
      input.visibility === "public" ||
      input.visibility === "private" ||
      input.visibility === "password"
        ? input.visibility
        : undefined,
    socialSharing: input.socialSharing,
    allowFavorites: input.allowFavorites,
    allowDownloads: input.allowDownloads,
    showPhotographerCredit: input.showPhotographerCredit,
    emailNotifications: input.emailNotifications,
    expirationDate: input.expirationDate,
    slug: input.slug,
    accessPin: input.accessPin,
  });

  const existingDelivery = (existing.delivery ?? {}) as Record<string, unknown>;

  if (input.bookingId !== undefined) {
    if (input.bookingId) {
      await linkGalleryToBooking(galleryId, input.bookingId, studio.id);
    } else {
      await unlinkGalleryFromBookings(galleryId);
    }
  }

  const gallery = await prisma.gallery.update({
    where: { id: galleryId },
    data: {
      title: input.title?.trim(),
      description: input.description?.trim(),
      category: input.category,
      clientId: input.clientId,
      ...(input.coverAssetKey
        ? { coverAssetKey: normalizeAssetKey(input.coverAssetKey) }
        : {}),
      status: mapped?.status,
      workflowStatus: mapped?.workflowStatus,
      settings: mergedSettings,
      delivery: {
        ...existingDelivery,
        ...(input.accessPin !== undefined
          ? input.accessPin.trim()
            ? { accessPin: input.accessPin.trim() }
            : { accessPin: undefined }
          : {}),
        ...(input.expirationDate ? { expiresAt: input.expirationDate } : {}),
      },
    },
    include: galleryBookingInclude,
  });

  await syncBookingProgressForGallery(gallery.id);

  return toApiGallery(gallery);
}

export async function uploadGalleryPhotos(
  photographerUserId: string,
  galleryId: string,
  photos: UploadPhotoInput[],
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, studioId: studio.id },
    include: { photos: true },
  });

  if (!gallery) {
    throw new AppError("Gallery not found", 404);
  }

  const startOrder = gallery.photos.length;
  const photoCount = startOrder + photos.length;
  const coverAssetKey = gallery.coverAssetKey ?? normalizeAssetKey(photos[0]?.assetKey ?? "");

  // Inserting the rows and updating the gallery's counters have to commit
  // together. If the photos landed but photoCount did not, the gallery would
  // hold photos while still reporting zero — and deliver() rejects a gallery
  // with no photos, so it became undeliverable with no way to tell why.
  const updated = await prisma.$transaction(async (tx) => {
    await tx.galleryPhoto.createMany({
      data: photos.map((photo, index) => {
        const assetKey = normalizeAssetKey(photo.assetKey);
        return {
          galleryId: gallery.id,
          assetKey,
          thumbnailAssetKey: photo.thumbnailAssetKey
            ? normalizeAssetKey(photo.thumbnailAssetKey)
            : cloudinaryThumbnailUrl(assetKey),
          alt: photo.alt?.trim() || `${gallery.title} photo ${startOrder + index + 1}`,
          sortOrder: startOrder + index,
        };
      }),
    });

    return tx.gallery.update({
      where: { id: gallery.id },
      data: {
        photoCount,
        coverAssetKey: coverAssetKey || gallery.coverAssetKey,
        workflowStatus: gallery.workflowStatus === "delivered" ? "delivered" : "editing",
      },
      include: {
        ...galleryBookingInclude,
        photos: { orderBy: { sortOrder: "asc" } },
      },
    });
  });

  await syncBookingProgressForGallery(updated.id);

  return {
    gallery: toApiGallery(updated),
    photos: updated.photos.map(toApiGalleryPhoto),
  };
}

/**
 * The counter update for a gallery whose photo set has changed, as a pending
 * Prisma operation so callers can commit it alongside the change that caused
 * it rather than as a separate write that can fail on its own.
 */

export async function deleteGalleryPhoto(
  photographerUserId: string,
  galleryId: string,
  photoId: string,
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  const photo = gallery.photos.find((item) => item.id === photoId);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  const remainingPhotos = gallery.photos.filter((item) => item.id !== photoId);

  // Deleting the row and recomputing the gallery's counters commit together,
  // otherwise photoCount, coverAssetKey and storageUsedGb keep describing a
  // photo that no longer exists.
  await prisma.$transaction([
    prisma.galleryPhoto.delete({ where: { id: photoId } }),
    galleryPhotoStatsUpdate(gallery.id, remainingPhotos, gallery.coverAssetKey, [
      photo.assetKey,
    ]),
  ]);

  const refreshed = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  await syncBookingProgressForGallery(refreshed.id);
  return buildGalleryDetailResponse(refreshed);
}

export async function updateGalleryPhoto(
  photographerUserId: string,
  galleryId: string,
  photoId: string,
  input: { alt?: string; assetKey?: string },
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  const photo = gallery.photos.find((item) => item.id === photoId);

  if (!photo) {
    throw new AppError("Photo not found", 404);
  }

  const assetKey = input.assetKey ? normalizeAssetKey(input.assetKey) : undefined;

  await prisma.galleryPhoto.update({
    where: { id: photoId },
    data: {
      ...(input.alt !== undefined ? { alt: input.alt.trim() || photo.alt } : {}),
      ...(assetKey
        ? {
            assetKey,
            thumbnailAssetKey: cloudinaryThumbnailUrl(assetKey),
          }
        : {}),
    },
  });

  const refreshed = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  return buildGalleryDetailResponse(refreshed);
}

export async function reorderGalleryPhotos(
  photographerUserId: string,
  galleryId: string,
  photoIds: string[],
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);

  if (photoIds.length !== gallery.photos.length) {
    throw new AppError("Provide the full ordered list of gallery photo IDs", 400);
  }

  const existingIds = new Set(gallery.photos.map((photo) => photo.id));
  if (photoIds.some((id) => !existingIds.has(id))) {
    throw new AppError("One or more photo IDs are invalid for this gallery", 400);
  }

  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.galleryPhoto.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  const refreshed = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  await syncGalleryPhotoStats(
    gallery.id,
    refreshed.photos.map((photo) => ({ assetKey: photo.assetKey })),
    gallery.coverAssetKey,
  );

  const synced = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  return buildGalleryDetailResponse(synced);
}

type UpdateGalleryDeliveryInput = {
  allowDownloads?: boolean;
  highResDownloads?: boolean;
  watermarkEnabled?: boolean;
  clientNotified?: boolean;
  deliveryNotes?: string;
  accessPin?: string;
  expiresAt?: string;
};

export async function updateGalleryDelivery(
  photographerUserId: string,
  galleryId: string,
  input: UpdateGalleryDeliveryInput,
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  const existingDelivery = (gallery.delivery ?? {}) as Record<string, unknown>;
  const mergedSettings = mergeGallerySettings(gallery, {
    allowDownloads: input.allowDownloads,
    accessPin: input.accessPin,
    expirationDate: input.expiresAt,
  });

  const updated = await prisma.gallery.update({
    where: { id: gallery.id },
    data: {
      settings: mergedSettings,
      delivery: {
        ...existingDelivery,
        ...(input.highResDownloads !== undefined
          ? { highResDownloads: input.highResDownloads }
          : {}),
        ...(input.watermarkEnabled !== undefined
          ? { watermarkEnabled: input.watermarkEnabled }
          : {}),
        ...(input.clientNotified !== undefined
          ? { clientNotified: input.clientNotified }
          : {}),
        ...(input.deliveryNotes !== undefined
          ? { deliveryNotes: input.deliveryNotes.trim() }
          : {}),
        ...(input.accessPin !== undefined
          ? input.accessPin.trim()
            ? { accessPin: input.accessPin.trim() }
            : { accessPin: undefined }
          : {}),
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      },
    },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return buildGalleryDetailResponse(updated);
}

export async function deliverPhotographerGallery(
  photographerUserId: string,
  galleryId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const gallery = await prisma.gallery.findFirst({
    where: { id: galleryId, studioId: studio.id },
    include: { booking: true },
  });

  if (!gallery) {
    throw new AppError("Gallery not found", 404);
  }

  assertGalleryReleaseAllowed(gallery.booking);

  if (gallery.photoCount === 0) {
    throw new AppError("Add photos before delivering the gallery", 400);
  }

  const delivery = (gallery.delivery ?? {}) as Record<string, unknown>;
  const settings = readStoredGallerySettings(gallery);
  const downloadEnabled = resolveDownloadEnabled(
    { workflowStatus: "delivered" },
    settings,
  );

  const updated = await prisma.gallery.update({
    where: { id: gallery.id },
    data: {
      status: "published",
      workflowStatus: "delivered",
      isNew: true,
      delivery: {
        ...delivery,
        downloadEnabled,
        highResDownloads: downloadEnabled,
        watermarkEnabled: !downloadEnabled,
        clientNotified: true,
        deliveryNotes: downloadEnabled
          ? "Full gallery delivered. Client has download access until the expiration date."
          : "Full gallery delivered. Downloads remain disabled in delivery settings.",
      },
    },
    include: galleryBookingInclude,
  });

  await syncBookingProgressForGallery(updated.id);

  const clientUser = await prisma.user.findUnique({
    where: { email: updated.clientEmail.toLowerCase() },
  });

  if (clientUser && !updated.clientUserId) {
    await prisma.gallery.update({
      where: { id: updated.id },
      data: { clientUserId: clientUser.id },
    });
  }

  if (clientUser) {
    await createNotification({
      userId: clientUser.id,
      category: "gallery",
      title: "Gallery delivered",
      description: `${updated.title} · ${updated.photoCount} photos ready to view.`,
      actionHref: `/client/galleries/${updated.id}`,
      metadata: { actionLabel: "viewDetails" },
    });
  }

  return toApiGallery(updated);
}

export async function notifyClientAboutGallery(
  photographerUserId: string,
  galleryId: string,
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);

  if (gallery.status === "archived") {
    throw new AppError("Archived galleries cannot notify clients", 400);
  }

  const clientUserId = gallery.clientUserId
    ? gallery.clientUserId
    : await findClientUserIdByEmail(gallery.clientEmail);

  if (!clientUserId) {
    throw new AppError(
      "This client does not have an active Shutterdesk account to notify yet.",
      400,
    );
  }

  const notificationCopy = resolveGalleryNotificationCopy(gallery);

  await createNotification({
    userId: clientUserId,
    category: "gallery",
    title: notificationCopy.title,
    description: notificationCopy.description,
    actionHref: `/client/galleries/${gallery.id}`,
    metadata: { actionLabel: "viewDetails" },
  });

  const delivery = (gallery.delivery ?? {}) as Record<string, unknown>;
  const activities = appendGalleryActivity(gallery.activities, {
    type: "share",
    description: `Studio notified ${gallery.clientName} about gallery updates.`,
  });

  const updated = await prisma.gallery.update({
    where: { id: gallery.id },
    data: {
      activities,
      delivery: {
        ...delivery,
        clientNotified: true,
      },
      ...(!gallery.clientUserId ? { clientUserId } : {}),
    },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return {
    gallery: toApiGallery(updated),
    meta: toApiGalleryDetailMeta(updated),
    photos: updated.photos.map(toApiGalleryPhoto),
  };
}

export async function archivePhotographerGallery(
  photographerUserId: string,
  galleryId: string,
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);

  if (gallery.status === "archived") {
    throw new AppError("Gallery is already archived", 400);
  }

  const delivery = (gallery.delivery ?? {}) as Record<string, unknown>;
  const activities = appendGalleryActivity(gallery.activities, {
    type: "view",
    description: "Gallery archived by studio.",
  });

  const updated = await prisma.gallery.update({
    where: { id: gallery.id },
    data: {
      status: "archived",
      activities,
      delivery: {
        ...delivery,
        deliveryNotes: "This gallery has been archived and is no longer available to clients.",
      },
    },
    include: {
      ...galleryBookingInclude,
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  return {
    gallery: toApiGallery(updated),
    meta: toApiGalleryDetailMeta(updated),
    photos: updated.photos.map(toApiGalleryPhoto),
  };
}

export async function exportPhotographerGalleryReport(
  photographerUserId: string,
  galleryId: string,
) {
  const gallery = await getOwnedGalleryOrThrow(photographerUserId, galleryId);
  const meta = toApiGalleryDetailMeta(gallery);

  return {
    exportedAt: new Date().toISOString(),
    gallery: toApiGallery(gallery),
    analytics: meta.analytics,
    activities: meta.activities,
    delivery: meta.delivery,
    settings: meta.settings,
    summary: {
      photoCount: gallery.photoCount,
      views: gallery.views,
      downloads: gallery.downloads,
      storageUsedGb: gallery.storageUsedGb,
      storageTotalGb: gallery.storageTotalGb,
    },
  };
}
