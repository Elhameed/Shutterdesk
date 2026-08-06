import type { Gallery } from "@prisma/client";

export type GalleryVisibility = "public" | "private" | "password";

export type GalleryStoredSettings = {
  visibility: GalleryVisibility;
  allowSharing: boolean;
  allowFavorites: boolean;
  allowDownloads: boolean;
  showPhotographerCredit: boolean;
  emailNotifications: boolean;
  expirationDate: string;
  slug: string;
  accessPin?: string;
};

export type GallerySettingsInput = Partial<{
  visibility: GalleryVisibility;
  socialSharing: boolean;
  allowFavorites: boolean;
  allowDownloads: boolean;
  showPhotographerCredit: boolean;
  emailNotifications: boolean;
  expirationDate: string;
  slug: string;
  accessPin: string;
}>;

const DEFAULT_SETTINGS: GalleryStoredSettings = {
  visibility: "private",
  allowSharing: false,
  allowFavorites: true,
  allowDownloads: false,
  showPhotographerCredit: true,
  emailNotifications: true,
  expirationDate: "2026-08-30",
  slug: "",
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveGallerySlug(
  gallery: Pick<Gallery, "title" | "id">,
) {
  const title = gallery.title?.trim() || "gallery";
  return `${slugify(title)}-${gallery.id.slice(0, 8)}`;
}

export function readStoredGallerySettings(
  gallery: Pick<Gallery, "settings" | "status" | "workflowStatus" | "title" | "id">,
): GalleryStoredSettings {
  const stored =
    gallery.settings && typeof gallery.settings === "object"
      ? (gallery.settings as Record<string, unknown>)
      : {};

  const defaultSlug = resolveGallerySlug(gallery);

  return {
    visibility:
      stored.visibility === "public" ||
      stored.visibility === "private" ||
      stored.visibility === "password"
        ? stored.visibility
        : gallery.status === "published"
          ? gallery.workflowStatus === "delivered"
            ? "public"
            : "private"
          : DEFAULT_SETTINGS.visibility,
    allowSharing:
      typeof stored.allowSharing === "boolean"
        ? stored.allowSharing
        : gallery.status === "published",
    allowFavorites:
      typeof stored.allowFavorites === "boolean"
        ? stored.allowFavorites
        : DEFAULT_SETTINGS.allowFavorites,
    allowDownloads:
      typeof stored.allowDownloads === "boolean"
        ? stored.allowDownloads
        : DEFAULT_SETTINGS.allowDownloads,
    showPhotographerCredit:
      typeof stored.showPhotographerCredit === "boolean"
        ? stored.showPhotographerCredit
        : DEFAULT_SETTINGS.showPhotographerCredit,
    emailNotifications:
      typeof stored.emailNotifications === "boolean"
        ? stored.emailNotifications
        : DEFAULT_SETTINGS.emailNotifications,
    expirationDate:
      typeof stored.expirationDate === "string"
        ? stored.expirationDate
        : DEFAULT_SETTINGS.expirationDate,
    slug: typeof stored.slug === "string" ? stored.slug : defaultSlug,
    accessPin: typeof stored.accessPin === "string" ? stored.accessPin : undefined,
  };
}

export function mergeGallerySettings(
  gallery: Pick<Gallery, "settings" | "status" | "workflowStatus" | "title" | "id">,
  input: GallerySettingsInput = {},
): GalleryStoredSettings {
  const current = readStoredGallerySettings(gallery);

  return {
    ...current,
    ...(input.visibility ? { visibility: input.visibility } : {}),
    ...(input.socialSharing !== undefined
      ? { allowSharing: input.socialSharing }
      : {}),
    ...(input.allowFavorites !== undefined
      ? { allowFavorites: input.allowFavorites }
      : {}),
    ...(input.allowDownloads !== undefined
      ? { allowDownloads: input.allowDownloads }
      : {}),
    ...(input.showPhotographerCredit !== undefined
      ? { showPhotographerCredit: input.showPhotographerCredit }
      : {}),
    ...(input.emailNotifications !== undefined
      ? { emailNotifications: input.emailNotifications }
      : {}),
    ...(input.expirationDate ? { expirationDate: input.expirationDate } : {}),
    ...(input.slug ? { slug: input.slug } : {}),
    ...(input.accessPin !== undefined
      ? { accessPin: input.accessPin.trim() || undefined }
      : {}),
  };
}

export function resolveDownloadEnabled(
  gallery: Pick<Gallery, "workflowStatus">,
  settings: Pick<GalleryStoredSettings, "allowDownloads">,
): boolean {
  return gallery.workflowStatus === "delivered" && settings.allowDownloads;
}

export function resolveHighResDownloads(
  gallery: Pick<Gallery, "workflowStatus">,
  settings: Pick<GalleryStoredSettings, "allowDownloads">,
): boolean {
  return resolveDownloadEnabled(gallery, settings);
}

export function resolveGalleryAccessPin(
  gallery: Pick<Gallery, "delivery" | "settings" | "status" | "workflowStatus" | "title" | "id">,
  settings?: GalleryStoredSettings,
): string | null {
  const resolved = settings ?? readStoredGallerySettings(gallery);
  const delivery = (gallery.delivery ?? {}) as Record<string, unknown>;
  const pin =
    resolved.accessPin?.trim() ||
    (typeof delivery.accessPin === "string" ? delivery.accessPin.trim() : "");

  return pin || null;
}

export function isGalleryPinProtected(settings: GalleryStoredSettings): boolean {
  return settings.visibility === "password";
}

export function isGalleryExpired(settings: Pick<GalleryStoredSettings, "expirationDate">): boolean {
  const parsed = new Date(settings.expirationDate);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const endOfDay = new Date(parsed);
  endOfDay.setHours(23, 59, 59, 999);
  return Date.now() > endOfDay.getTime();
}

export function verifyGalleryAccessPin(
  gallery: Pick<Gallery, "delivery" | "settings" | "status" | "workflowStatus" | "title" | "id">,
  submittedPin: string,
): boolean {
  const settings = readStoredGallerySettings(gallery);
  if (!isGalleryPinProtected(settings)) {
    return true;
  }

  const resolvedPin = resolveGalleryAccessPin(gallery, settings);
  if (!resolvedPin) {
    return false;
  }

  return submittedPin.trim() === resolvedPin;
}

export type GalleryClientAccessOptions = {
  accessPin?: string;
};

export type GalleryClientAccessState = {
  pinRequired: boolean;
  pinVerified: boolean;
  expired: boolean;
};

export function resolveGalleryClientAccess(
  gallery: Pick<Gallery, "delivery" | "settings" | "status" | "workflowStatus" | "title" | "id">,
  options: GalleryClientAccessOptions = {},
): GalleryClientAccessState {
  const settings = readStoredGallerySettings(gallery);
  const expired = isGalleryExpired(settings);
  const pinRequired = isGalleryPinProtected(settings);

  if (expired || !pinRequired) {
    return {
      pinRequired,
      pinVerified: !expired && !pinRequired,
      expired,
    };
  }

  const resolvedPin = resolveGalleryAccessPin(gallery, settings);
  const submittedPin = options.accessPin?.trim() ?? "";
  const pinVerified = Boolean(resolvedPin && submittedPin === resolvedPin);

  return {
    pinRequired: true,
    pinVerified,
    expired: false,
  };
}

export function formatExpirationLabel(expirationDate: string) {
  const parsed = new Date(expirationDate);
  if (Number.isNaN(parsed.getTime())) {
    return expirationDate;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function buildPrivateGalleryLink(gallery: Pick<Gallery, "title" | "id">, slug?: string) {
  const resolvedSlug = slug?.trim() || resolveGallerySlug(gallery);
  return `shutterdesk.rw/g/${resolvedSlug}`;
}

export function isGalleryStatusLocked(
  gallery: Pick<Gallery, "status" | "workflowStatus">,
): boolean {
  return gallery.workflowStatus === "delivered" || gallery.status === "archived";
}
