import type { Gallery, GalleryPhoto, GalleryWorkflowStatus } from "@prisma/client";
import { formatDisplayDate } from "../../lib/date-format.js";
import {
  buildPrivateGalleryLink,
  formatExpirationLabel,
  isGalleryPinProtected,
  readStoredGallerySettings,
  resolveDownloadEnabled,
  resolveGalleryAccessPin,
  resolveHighResDownloads,
} from "../../lib/gallery-settings.js";

export type GalleryWithBooking = Gallery & {
  booking?: { id: string } | null;
};

export type ApiGallery = {
  id: string;
  title: string;
  clientName: string;
  category: string;
  status: string;
  workflowStatus: string;
  photoCount: number;
  coverAssetKey: string | null;
  uploadedDate: string;
  uploadedAt: string;
  views: number;
  downloads: number;
  likes: number;
  description: string | null;
  clientId: string;
  relatedBookingId: string | null;
  isNew: boolean;
};

export type ApiGalleryPhoto = {
  id: string;
  assetKey: string;
  thumbnailAssetKey: string | null;
  alt: string;
};

export type ApiGalleryDetailMeta = {
  clientId: string;
  clientEmail: string;
  clientInitials: string;
  shootDate: string;
  location: string;
  storageUsedGb: number;
  storageTotalGb: number;
  activities: unknown[];
  delivery: Record<string, unknown>;
  analytics: Record<string, unknown>;
  settings: Record<string, unknown>;
};

function getInitials(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildDeliverySteps(gallery: Gallery) {
  const status = gallery.workflowStatus;
  const stepStatuses =
    status === "editing"
      ? ["completed", "current", "upcoming", "upcoming"]
      : status === "ready"
        ? ["completed", "completed", "current", "upcoming"]
        : ["completed", "completed", "completed", "completed"];

  const uploadedDate = formatDisplayDate(gallery.uploadedAt);

  return [
    { id: "uploaded", label: "Photos uploaded", date: uploadedDate, status: stepStatuses[0] },
    {
      id: "proofs",
      label: "Proofs shared with client",
      date: status !== "editing" ? uploadedDate : undefined,
      status: stepStatuses[1],
    },
    {
      id: "review",
      label: "Client review & selections",
      date: status === "delivered" ? uploadedDate : undefined,
      status: stepStatuses[2],
    },
    {
      id: "delivered",
      label: "Final gallery delivered",
      date: status === "delivered" ? uploadedDate : undefined,
      status: stepStatuses[3],
    },
  ];
}

function buildDeliveryData(
  gallery: Gallery,
  audience: "photographer" | "client" = "photographer",
  access?: { pinRequired?: boolean; pinVerified?: boolean; expired?: boolean },
) {
  const stored = (gallery.delivery ?? {}) as Record<string, unknown>;
  const settings = readStoredGallerySettings(gallery);
  const downloadEnabled = resolveDownloadEnabled(gallery, settings);
  const defaultHighRes = resolveHighResDownloads(gallery, settings);
  const resolvedPin = resolveGalleryAccessPin(gallery, settings);
  const pinRequired = isGalleryPinProtected(settings);

  const base = {
    privateLink: buildPrivateGalleryLink(gallery, settings.slug),
    expiresAt:
      typeof stored.expiresAt === "string"
        ? stored.expiresAt
        : formatExpirationLabel(settings.expirationDate),
    downloadEnabled,
    highResDownloads:
      typeof stored.highResDownloads === "boolean"
        ? stored.highResDownloads
        : defaultHighRes,
    watermarkEnabled:
      typeof stored.watermarkEnabled === "boolean"
        ? stored.watermarkEnabled
        : !downloadEnabled,
    clientNotified:
      typeof stored.clientNotified === "boolean"
        ? stored.clientNotified
        : gallery.workflowStatus !== "editing",
    deliveryNotes:
      typeof stored.deliveryNotes === "string"
        ? stored.deliveryNotes
        : gallery.workflowStatus === "editing"
          ? "Gallery is still in post-production. Client will be notified once proofs are ready for review."
          : gallery.workflowStatus === "ready"
            ? "Awaiting client photo selections before unlocking full-resolution downloads."
            : downloadEnabled
              ? "Full gallery delivered. Client has download access until the expiration date."
              : "Full gallery delivered. Downloads remain disabled in delivery settings.",
    steps: buildDeliverySteps(gallery),
  };

  if (audience === "client") {
    return {
      ...base,
      pinRequired,
      pinVerified: access?.pinVerified ?? !pinRequired,
      expired: access?.expired ?? false,
    };
  }

  return {
    ...base,
    accessPin: resolvedPin ?? "",
    pinRequired,
  };
}

function buildAnalyticsData(gallery: Gallery, photos: GalleryPhoto[] = []) {
  const stored = (gallery.analytics ?? {}) as Record<string, unknown>;
  const topPhotosFromDb =
    photos.length > 0
      ? photos.slice(0, 3).map((photo, index) => ({
          rank: index + 1,
          label: photo.alt || `${gallery.title} photo ${index + 1}`,
          views: Math.max(1, Math.round(gallery.views / Math.max(photos.length, 1))),
          downloads: Math.max(0, Math.round(gallery.downloads / Math.max(photos.length, 1))),
        }))
      : [];

  const fallbackTopPhotos = [
    {
      rank: 1,
      label: "Ceremony — First kiss",
      views: Math.round(gallery.views * 0.18),
      downloads: Math.round(gallery.downloads * 0.22),
    },
    {
      rank: 2,
      label: "Couple portrait — Golden hour",
      views: Math.round(gallery.views * 0.14),
      downloads: Math.round(gallery.downloads * 0.19),
    },
  ];

  if (stored.uniqueVisitors) {
    return {
      ...stored,
      topPhotos:
        Array.isArray(stored.topPhotos) && stored.topPhotos.length > 0
          ? stored.topPhotos
          : topPhotosFromDb.length > 0
            ? topPhotosFromDb
            : fallbackTopPhotos,
    };
  }

  return {
    uniqueVisitors: Math.max(1, Math.round(gallery.views * 0.42)),
    avgSessionDuration: gallery.category === "wedding" ? "4m 32s" : "2m 18s",
    engagementRate: Math.min(
      92,
      Math.round((gallery.likes / Math.max(gallery.views, 1)) * 100) + 24,
    ),
    weeklyViews: [
      { day: "Mon", value: Math.round(gallery.views * 0.12) },
      { day: "Tue", value: Math.round(gallery.views * 0.09) },
      { day: "Wed", value: Math.round(gallery.views * 0.14) },
      { day: "Thu", value: Math.round(gallery.views * 0.11) },
      { day: "Fri", value: Math.round(gallery.views * 0.16) },
      { day: "Sat", value: Math.round(gallery.views * 0.22) },
      { day: "Sun", value: Math.round(gallery.views * 0.16) },
    ],
    topPhotos: topPhotosFromDb.length > 0 ? topPhotosFromDb : fallbackTopPhotos,
  };
}

function buildSettingsData(gallery: Gallery) {
  const settings = readStoredGallerySettings(gallery);

  return {
    visibility: settings.visibility,
    allowSharing: settings.allowSharing,
    allowFavorites: settings.allowFavorites,
    allowDownloads: settings.allowDownloads,
    showPhotographerCredit: settings.showPhotographerCredit,
    emailNotifications: settings.emailNotifications,
    expirationDate: settings.expirationDate,
    slug: settings.slug || buildPrivateGalleryLink(gallery).replace("shutterdesk.rw/g/", ""),
    accessPin: settings.accessPin,
  };
}

export function toApiGallery(gallery: GalleryWithBooking): ApiGallery {
  return {
    id: gallery.id,
    title: gallery.title,
    clientName: gallery.clientName,
    category: gallery.category,
    status: gallery.status,
    workflowStatus: gallery.workflowStatus,
    photoCount: gallery.photoCount,
    coverAssetKey: gallery.coverAssetKey,
    uploadedDate: formatDisplayDate(gallery.uploadedAt),
    uploadedAt: gallery.uploadedAt.toISOString().slice(0, 10),
    views: gallery.views,
    downloads: gallery.downloads,
    likes: gallery.likes,
    description: gallery.description,
    clientId: gallery.clientId,
    relatedBookingId: gallery.booking?.id ?? null,
    isNew: gallery.isNew,
  };
}

export function toApiGalleryPhoto(photo: GalleryPhoto): ApiGalleryPhoto {
  return {
    id: photo.id,
    assetKey: photo.assetKey,
    thumbnailAssetKey: photo.thumbnailAssetKey,
    alt: photo.alt,
  };
}

export function toApiGalleryDetailMeta(
  gallery: Gallery,
  photos: GalleryPhoto[] = [],
  audience: "photographer" | "client" = "photographer",
  access?: { pinRequired?: boolean; pinVerified?: boolean; expired?: boolean },
): ApiGalleryDetailMeta {
  const activities = Array.isArray(gallery.activities) ? gallery.activities : [];

  return {
    clientId: gallery.clientId,
    clientEmail: gallery.clientEmail,
    clientInitials: getInitials(gallery.clientName),
    shootDate: gallery.shootDate ?? formatDisplayDate(gallery.uploadedAt),
    location: gallery.location ?? "Kigali, Rwanda",
    storageUsedGb: gallery.storageUsedGb,
    storageTotalGb: gallery.storageTotalGb,
    activities,
    delivery: buildDeliveryData(gallery, audience, access),
    analytics: buildAnalyticsData(gallery, photos),
    settings: buildSettingsData(gallery),
  };
}

export function mapStatusSegmentToWorkflow(
  segment: "draft" | "editing" | "ready",
): { status: Gallery["status"]; workflowStatus: GalleryWorkflowStatus } {
  if (segment === "draft") {
    return { status: "draft", workflowStatus: "editing" };
  }
  if (segment === "ready") {
    return { status: "published", workflowStatus: "ready" };
  }
  return { status: "published", workflowStatus: "editing" };
}
