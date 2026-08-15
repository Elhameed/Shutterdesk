import { assetUrl } from "@/lib/asset-url";
import type {
  ApiServicePackage,
  ServiceDetailIcon,
  ServicePackage,
} from "@/types/domains/service";

export const PUBLISHED_DEFAULT_SERVICE_COVER =
  "landing/gallery/wedding/gallery-wedding-couple";

const publishedDefaultCover = assetUrl(PUBLISHED_DEFAULT_SERVICE_COVER);

function isDraftPackage(api: ApiServicePackage) {
  return api.badges.includes("draft") || !api.isActive;
}

function normalizeCoverKey(assetKey: string) {
  return assetKey.replace(/^\//, "");
}

function resolveCover(api: ApiServicePackage): string | null {
  const key = api.coverAssetKey?.trim();
  if (!key) return null;

  const normalizedKey = normalizeCoverKey(key);
  if (
    isDraftPackage(api) &&
    normalizedKey === PUBLISHED_DEFAULT_SERVICE_COVER
  ) {
    return null;
  }

  if (key.startsWith("http") || key.startsWith("data:")) return key;

  const resolved = assetUrl(normalizedKey);
  if (resolved) return resolved;

  return isDraftPackage(api) ? null : publishedDefaultCover;
}

const DETAIL_ICONS = new Set<ServiceDetailIcon>([
  "clock",
  "camera",
  "pencil",
  "image",
  "download",
]);

function toDetailIcon(value: string): ServiceDetailIcon {
  return DETAIL_ICONS.has(value as ServiceDetailIcon)
    ? (value as ServiceDetailIcon)
    : "clock";
}

export function serviceCoverDisplayUrl(coverImage: string | null) {
  return coverImage ?? publishedDefaultCover;
}

export function mapApiServicePackage(api: ApiServicePackage): ServicePackage {
  const coverImage = resolveCover(api);

  return {
    id: api.id,
    title: api.title,
    price: api.price,
    description: api.description,
    coverImage,
    hasCoverImage: coverImage !== null,
    badges: api.badges as ServicePackage["badges"],
    details: [
      { icon: toDetailIcon(api.details[0].icon), label: api.details[0].label },
      { icon: toDetailIcon(api.details[1].icon), label: api.details[1].label },
    ],
    totalRevenue: api.totalRevenue,
    category: api.category,
    isActive: api.isActive,
    depositPercent: api.depositPercent,
    currency: "rwf",
    duration: api.duration as ServicePackage["duration"],
    photographers: api.photographers,
    locationType: api.locationType as ServicePackage["locationType"],
    editedPhotos: api.editedPhotos,
    revisions: api.revisions,
    onlineGallery: api.onlineGallery,
    printDelivery: api.printDelivery,
    commercialLicense: api.commercialLicense,
    includes: api.includes,
    additionalNotes: api.additionalNotes,
  };
}
