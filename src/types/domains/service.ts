export type ServiceBadgeType =
  | "popular"
  | "public"
  | "new"
  | "featured"
  | "private"
  | "draft"
  | "archived";

export type ServiceDetailIcon =
  | "clock"
  | "camera"
  | "pencil"
  | "image"
  | "download";

export type ServiceCategory =
  | "wedding"
  | "portrait"
  | "commercial"
  | "editorial";

export type ServiceDurationKey = "30min" | "1hr" | "2hr" | "4hr" | "fullday";

export type ServiceLocationType = "studio" | "outdoor" | "client" | "hybrid";

export type ServicePackageFormValues = {
  packageName: string;
  category: ServiceCategory;
  isActive: boolean;
  price: string;
  depositPercent: number;
  currency: string;
  duration: ServiceDurationKey;
  photographers: string;
  locationType: ServiceLocationType;
  editedPhotos: string;
  revisions: string;
  onlineGallery: boolean;
  printDelivery: boolean;
  commercialLicense: boolean;
  description: string;
  additionalNotes: string;
  includes: string[];
};

export type ServicePackage = {
  id: string;
  title: string;
  price: number;
  description: string;
  coverImage: string | null;
  hasCoverImage: boolean;
  badges: ServiceBadgeType[];
  details: [
    { icon: ServiceDetailIcon; label: string },
    { icon: ServiceDetailIcon; label: string },
  ];
  totalRevenue: number;
  category: ServiceCategory;
  isActive: boolean;
  depositPercent: number;
  currency: "rwf";
  duration: ServiceDurationKey;
  photographers: number;
  locationType: ServiceLocationType;
  editedPhotos: number;
  revisions: number;
  onlineGallery: boolean;
  printDelivery: boolean;
  commercialLicense: boolean;
  includes: string[];
  additionalNotes: string;
};

export type ApiServicePackage = {
  id: string;
  title: string;
  price: number;
  description: string;
  coverAssetKey: string | null;
  badges: string[];
  details: [{ icon: string; label: string }, { icon: string; label: string }];
  totalRevenue: number;
  category: ServiceCategory;
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

export type CreateServiceInput = {
  title?: string;
  description?: string;
  price?: number;
  depositPercent?: number;
  category?: ServiceCategory;
  duration?: ServiceDurationKey;
  isActive?: boolean;
  isDraft?: boolean;
  coverAssetKey?: string;
  badges?: ServiceBadgeType[];
  photographers?: number;
  locationType?: ServiceLocationType;
  editedPhotos?: number;
  revisions?: number;
  onlineGallery?: boolean;
  printDelivery?: boolean;
  commercialLicense?: boolean;
  includes?: string[];
  additionalNotes?: string;
};

export function getDefaultServiceFormValues(): ServicePackageFormValues {
  return {
    packageName: "",
    category: "wedding",
    isActive: true,
    price: "0",
    depositPercent: 25,
    currency: "rwf",
    duration: "1hr",
    photographers: "1",
    locationType: "studio",
    editedPhotos: "25",
    revisions: "1",
    onlineGallery: true,
    printDelivery: false,
    commercialLicense: false,
    description: "",
    additionalNotes: "",
    includes: ["High-res photos", "Private Gallery", "Professional Editing"],
  };
}

export function servicePackageToFormValues(
  pkg: ServicePackage,
): ServicePackageFormValues {
  return {
    packageName: pkg.title,
    category: pkg.category,
    isActive: pkg.isActive,
    price: String(pkg.price),
    depositPercent: pkg.depositPercent,
    currency: pkg.currency,
    duration: pkg.duration,
    photographers: String(pkg.photographers),
    locationType: pkg.locationType,
    editedPhotos: String(pkg.editedPhotos),
    revisions: String(pkg.revisions),
    onlineGallery: pkg.onlineGallery,
    printDelivery: pkg.printDelivery,
    commercialLicense: pkg.commercialLicense,
    description: pkg.description,
    additionalNotes: pkg.additionalNotes,
    includes: [...pkg.includes],
  };
}

export function searchServicePackages(
  packages: ServicePackage[],
  query: string,
): ServicePackage[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return packages;

  return packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(normalized) ||
      pkg.description.toLowerCase().includes(normalized) ||
      pkg.details.some((detail) =>
        detail.label.toLowerCase().includes(normalized),
      ) ||
      pkg.badges.some((badge) => badge.includes(normalized)),
  );
}

export function isBookableServicePackage(pkg: ServicePackage) {
  return (
    pkg.isActive &&
    !pkg.badges.includes("archived") &&
    !pkg.badges.includes("draft")
  );
}
