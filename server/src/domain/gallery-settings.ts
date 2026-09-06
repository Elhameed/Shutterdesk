import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Gallery } from "@prisma/client";

/** Constant-time compare so a wrong PIN leaks nothing through response timing. */
function pinsMatch(submitted: string, expected: string) {
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  // `timingSafeEqual` throws on length mismatch, which would itself be a leak,
  // so compare lengths separately and still run the constant-time check.
  return a.length === b.length && timingSafeEqual(a, b);
}

export type GalleryVisibility = "public" | "private" | "password";

export type GalleryStoredSettings = {
  visibility: GalleryVisibility;
  allowSharing: boolean;
  allowFavorites: boolean;
  allowDownloads: boolean;
  showPhotographerCredit: boolean;
  emailNotifications: boolean;
  /**
   * `null` means the gallery never expires. Expiry is opt-in: a fixed default
   * date here once silently locked every client out of every gallery the day it
   * passed, so an unset value must always read as "no expiry".
   */
  expirationDate: string | null;
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
  expirationDate: null,
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

/**
 * The shape as stored on `Gallery.settings`.
 *
 * Every field is optional and individually `.catch(undefined)`: this column
 * holds whatever an older version of the app wrote, so one field going bad
 * must degrade that field to its default rather than discard the whole blob,
 * and reading must never throw.
 */
const storedGallerySettingsSchema = z
  .object({
    visibility: z.enum(["public", "private", "password"]).optional().catch(undefined),
    allowSharing: z.boolean().optional().catch(undefined),
    allowFavorites: z.boolean().optional().catch(undefined),
    allowDownloads: z.boolean().optional().catch(undefined),
    showPhotographerCredit: z.boolean().optional().catch(undefined),
    emailNotifications: z.boolean().optional().catch(undefined),
    expirationDate: z.string().trim().min(1).optional().catch(undefined),
    slug: z.string().optional().catch(undefined),
    accessPin: z.string().optional().catch(undefined),
  })
  .catch({});

/**
 * Some defaults are derived from the gallery rather than fixed — a published
 * gallery is shareable and, once delivered, public — so they are applied here
 * rather than baked into the schema.
 */
export function readStoredGallerySettings(
  gallery: Pick<Gallery, "settings" | "status" | "workflowStatus" | "title" | "id">,
): GalleryStoredSettings {
  const stored = storedGallerySettingsSchema.parse(gallery.settings ?? {});

  const defaultVisibility: GalleryVisibility =
    gallery.status === "published"
      ? gallery.workflowStatus === "delivered"
        ? "public"
        : "private"
      : DEFAULT_SETTINGS.visibility;

  return {
    visibility: stored.visibility ?? defaultVisibility,
    allowSharing: stored.allowSharing ?? gallery.status === "published",
    allowFavorites: stored.allowFavorites ?? DEFAULT_SETTINGS.allowFavorites,
    allowDownloads: stored.allowDownloads ?? DEFAULT_SETTINGS.allowDownloads,
    showPhotographerCredit:
      stored.showPhotographerCredit ?? DEFAULT_SETTINGS.showPhotographerCredit,
    emailNotifications:
      stored.emailNotifications ?? DEFAULT_SETTINGS.emailNotifications,
    expirationDate: stored.expirationDate ?? DEFAULT_SETTINGS.expirationDate,
    slug: stored.slug ?? resolveGallerySlug(gallery),
    accessPin: stored.accessPin,
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
    // An empty string clears the date back to "never expires"; `undefined`
    // leaves whatever is already stored alone.
    ...(input.expirationDate !== undefined
      ? { expirationDate: input.expirationDate.trim() || null }
      : {}),
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
  if (!settings.expirationDate) {
    return false;
  }

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

  return pinsMatch(submittedPin.trim(), resolvedPin);
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
  const pinVerified = Boolean(resolvedPin && pinsMatch(submittedPin, resolvedPin));

  return {
    pinRequired: true,
    pinVerified,
    expired: false,
  };
}

export const NO_EXPIRY_LABEL = "No expiry";

export function formatExpirationLabel(expirationDate: string | null) {
  if (!expirationDate) {
    return NO_EXPIRY_LABEL;
  }

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
