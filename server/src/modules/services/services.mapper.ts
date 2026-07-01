import type { ClientCategory, ServicePackage } from "@prisma/client";

type ServiceMetadata = {
  badges?: string[];
  photographers?: number;
  locationType?: string;
  editedPhotos?: number;
  revisions?: number;
  onlineGallery?: boolean;
  printDelivery?: boolean;
  commercialLicense?: boolean;
  includes?: string[];
  additionalNotes?: string;
  currency?: string;
};

const DURATION_LABELS: Record<string, string> = {
  "30min": "30 Mins",
  "1hr": "90 Mins",
  "2hr": "2 Hours",
  "4hr": "4 Hours",
  fullday: "10 Hours",
};

function readMetadata(pkg: ServicePackage): ServiceMetadata {
  if (!pkg.metadata || typeof pkg.metadata !== "object") return {};
  return pkg.metadata as ServiceMetadata;
}

function buildDetails(pkg: ServicePackage, meta: ServiceMetadata) {
  const durationLabel = DURATION_LABELS[pkg.duration] ?? pkg.duration;
  const editedPhotos = meta.editedPhotos ?? 25;

  return [
    { icon: "clock" as const, label: durationLabel },
    {
      icon: (meta.printDelivery ? "download" : "camera") as "camera" | "download",
      label: meta.printDelivery
        ? "Digital Gallery"
        : `${editedPhotos}+ High-Res`,
    },
  ] as const;
}

export type ApiServicePackage = {
  id: string;
  title: string;
  price: number;
  description: string;
  coverAssetKey: string | null;
  badges: string[];
  details: [{ icon: string; label: string }, { icon: string; label: string }];
  totalRevenue: number;
  category: ClientCategory;
  isActive: boolean;
  depositPercent: number;
  currency: "rwf";
  duration: string;
  photographers: number;
  locationType: string;
  editedPhotos: number;
  revisions: number;
  onlineGallery: boolean;
  printDelivery: boolean;
  commercialLicense: boolean;
  includes: string[];
  additionalNotes: string;
};

export function toApiServicePackage(
  pkg: ServicePackage,
  totalRevenue?: number,
): ApiServicePackage {
  const meta = readMetadata(pkg);

  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.price,
    description: pkg.description,
    coverAssetKey: pkg.coverAssetKey,
    badges: meta.badges ?? [],
    details: [...buildDetails(pkg, meta)] as [
      { icon: string; label: string },
      { icon: string; label: string },
    ],
    totalRevenue: totalRevenue ?? pkg.totalRevenue,
    category: pkg.category,
    isActive: pkg.isActive,
    depositPercent: pkg.depositPercent,
    currency: "rwf",
    duration: pkg.duration,
    photographers: meta.photographers ?? 1,
    locationType: meta.locationType ?? "studio",
    editedPhotos: meta.editedPhotos ?? 25,
    revisions: meta.revisions ?? 1,
    onlineGallery: meta.onlineGallery ?? true,
    printDelivery: meta.printDelivery ?? false,
    commercialLicense: meta.commercialLicense ?? false,
    includes: meta.includes ?? [],
    additionalNotes: meta.additionalNotes ?? "",
  };
}

export function buildServiceMetadata(input: {
  badges?: string[];
  photographers?: number;
  locationType?: string;
  editedPhotos?: number;
  revisions?: number;
  onlineGallery?: boolean;
  printDelivery?: boolean;
  commercialLicense?: boolean;
  includes?: string[];
  additionalNotes?: string;
  currency?: string;
}): ServiceMetadata {
  return {
    badges: input.badges ?? [],
    photographers: input.photographers ?? 1,
    locationType: input.locationType ?? "studio",
    editedPhotos: input.editedPhotos ?? 25,
    revisions: input.revisions ?? 1,
    onlineGallery: input.onlineGallery ?? true,
    printDelivery: input.printDelivery ?? false,
    commercialLicense: input.commercialLicense ?? false,
    includes: input.includes ?? [],
    additionalNotes: input.additionalNotes ?? "",
    currency: input.currency ?? "rwf",
  };
}
