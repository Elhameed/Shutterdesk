import type { Gallery, GalleryPhoto, GalleryWorkflowStatus } from "@prisma/client";
import { z } from "zod";
import { formatDisplayDate } from "../../format/date-format.js";
import {
  buildPrivateGalleryLink,
  formatExpirationLabel,
  isGalleryPinProtected,
  readStoredGallerySettings,
  resolveDownloadEnabled,
  resolveGalleryAccessPin,
  resolveHighResDownloads,
} from "../../domain/gallery-settings.js";

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

/** The shape as stored on `Gallery.delivery`; see domain/json-column.ts. */
const storedDeliverySchema = z
  .object({
    expiresAt: z.string().optional().catch(undefined),
    highResDownloads: z.boolean().optional().catch(undefined),
    watermarkEnabled: z.boolean().optional().catch(undefined),
    clientNotified: z.boolean().optional().catch(undefined),
    deliveryNotes: z.string().optional().catch(undefined),
  })
  .catch({});

function defaultDeliveryNotes(gallery: Gallery, downloadEnabled: boolean) {
  if (gallery.workflowStatus === "editing") {
    return "Gallery is still in post-production. Client will be notified once proofs are ready for review.";
  }
  if (gallery.workflowStatus === "ready") {
    return "Awaiting client photo selections before unlocking full-resolution downloads.";
  }
  return downloadEnabled
    ? "Full gallery delivered. Client has download access until the expiration date."
    : "Full gallery delivered. Downloads remain disabled in delivery settings.";
}

function buildDeliveryData(
  gallery: Gallery,
  audience: "photographer" | "client" = "photographer",
  access?: { pinRequired?: boolean; pinVerified?: boolean; expired?: boolean },
) {
  const stored = storedDeliverySchema.parse(gallery.delivery ?? {});
  const settings = readStoredGallerySettings(gallery);
  const downloadEnabled = resolveDownloadEnabled(gallery, settings);
  const resolvedPin = resolveGalleryAccessPin(gallery, settings);
  const pinRequired = isGalleryPinProtected(settings);

  const base = {
    privateLink: buildPrivateGalleryLink(gallery, settings.slug),
    expiresAt: stored.expiresAt ?? formatExpirationLabel(settings.expirationDate),
    downloadEnabled,
    highResDownloads:
      stored.highResDownloads ?? resolveHighResDownloads(gallery, settings),
    watermarkEnabled: stored.watermarkEnabled ?? !downloadEnabled,
    clientNotified: stored.clientNotified ?? gallery.workflowStatus !== "editing",
    deliveryNotes: stored.deliveryNotes ?? defaultDeliveryNotes(gallery, downloadEnabled),
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

/**
 * Gallery analytics, limited to what is actually measured.
 *
 * This used to synthesise a full dashboard from formulas: unique visitors as
 * 42% of views, a weekly chart built from fixed daily ratios, an average
 * session duration picked from the gallery's category, hardcoded top-photo
 * captions ("Ceremony — First kiss"), and an engagement rate that always
 * evaluated to exactly 24 because `likes` is never written anywhere. None of it
 * was derived from anything a visitor did.
 *
 * Only two things are genuinely tracked today — gallery-level view and download
 * counts. Per-photo activity is not recorded at all, so there is no basis for
 * ranking photos. The client renders an explicit "not tracked yet" state for
 * everything absent here rather than being handed a plausible-looking number.
 */
function buildAnalyticsData(gallery: Gallery) {
  return {
    totalViews: gallery.views,
    totalDownloads: gallery.downloads,
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
    activities,
    delivery: buildDeliveryData(gallery, audience, access),
    analytics: buildAnalyticsData(gallery),
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
