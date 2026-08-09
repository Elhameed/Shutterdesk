import type {
  GalleryCategoryFilter,
  GallerySortOption,
  GalleryStatusFilter,
} from "@/constants/photographer-galleries";

export type GalleryCategory =
  | "wedding"
  | "portrait"
  | "graduation"
  | "commercial";

export type GalleryStatus = "published" | "draft" | "archived";
export type GalleryWorkflowStatus = "delivered" | "ready" | "editing";

export type PhotographerGallery = {
  id: string;
  title: string;
  clientName: string;
  category: GalleryCategory;
  status: GalleryStatus;
  workflowStatus: GalleryWorkflowStatus;
  photoCount: number;
  coverImage: string;
  uploadedDate: string;
  uploadedAt: string;
  views: number;
  downloads: number;
  likes: number;
  description?: string;
  clientId?: string;
  relatedBookingId?: string;
  isPlaceholder?: boolean;
  isNew?: boolean;
};

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

export type GalleryActivityType = "favorite" | "share" | "download" | "view";

export type GalleryActivity = {
  id: string;
  type: GalleryActivityType;
  description: string;
  timestamp: string;
};

export type GalleryDeliveryStepStatus = "completed" | "current" | "upcoming";

export type GalleryDeliveryStep = {
  id: string;
  label: string;
  date?: string;
  status: GalleryDeliveryStepStatus;
};

export type GalleryDeliveryData = {
  privateLink: string;
  accessPin?: string;
  pinRequired?: boolean;
  pinVerified?: boolean;
  expired?: boolean;
  expiresAt: string;
  downloadEnabled: boolean;
  highResDownloads: boolean;
  watermarkEnabled: boolean;
  clientNotified: boolean;
  deliveryNotes: string;
  steps: GalleryDeliveryStep[];
};

export type GalleryWeeklyView = {
  day: string;
  value: number;
};

export type GalleryTopPhoto = {
  rank: number;
  label: string;
  views: number;
  downloads: number;
};

export type GalleryAnalyticsData = {
  uniqueVisitors: number;
  avgSessionDuration: string;
  engagementRate: number;
  weeklyViews: GalleryWeeklyView[];
  topPhotos: GalleryTopPhoto[];
};

export type GalleryVisibility = "public" | "private" | "password";

export type GallerySettingsData = {
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

export type GalleryDetailMeta = {
  clientId: string;
  clientEmail: string;
  clientInitials: string;
  shootDate: string;
  location: string;
  storageUsedGb: number;
  storageTotalGb: number;
  activities: GalleryActivity[];
  delivery: GalleryDeliveryData;
  analytics: GalleryAnalyticsData;
  settings: GallerySettingsData;
};

export type GalleryDetail = {
  gallery: PhotographerGallery;
  meta: GalleryDetailMeta;
  photos: GalleryPhoto[];
};

export type ApiGallery = {
  id: string;
  title: string;
  clientName: string;
  category: GalleryCategory;
  status: GalleryStatus;
  workflowStatus: GalleryWorkflowStatus;
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

export const GALLERY_LIST_PAGE_SIZE = 6;
export const GALLERY_PHOTOS_PAGE_SIZE = 6;
export const GALLERY_PLAN_STORAGE_GB = 50;

export type CreateGalleryInput = {
  title: string;
  description?: string;
  category: GalleryCategory;
  clientId: string;
  bookingId?: string;
  visibility?: GalleryVisibility;
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

export type GalleryStatusSegment = "draft" | "editing" | "ready";

export type GalleryFormValues = {
  galleryName: string;
  category: GalleryCategory;
  description: string;
  clientId: string;
  relatedBookingId: string;
  visibility: GalleryVisibility;
  allowDownloads: boolean;
  allowFavorites: boolean;
  socialSharing: boolean;
  statusSegment: GalleryStatusSegment;
  photoCount: number;
  storageUsedGb: number;
  storageTotalGb: number;
  workflowStatus?: GalleryWorkflowStatus;
  galleryStatus?: GalleryStatus;
  accessPin?: string;
};

export function getDefaultGalleryFormValues(
  defaultClientId = "",
): GalleryFormValues {
  return {
    galleryName: "",
    category: "wedding",
    description: "",
    clientId: defaultClientId,
    relatedBookingId: "",
    visibility: "private",
    allowDownloads: false,
    allowFavorites: true,
    socialSharing: false,
    statusSegment: "draft",
    photoCount: 0,
    storageUsedGb: 0,
    storageTotalGb: GALLERY_PLAN_STORAGE_GB,
  };
}

function mapGalleryToStatusSegment(
  gallery: PhotographerGallery,
): GalleryStatusSegment {
  if (gallery.status === "draft") return "draft";
  if (
    gallery.workflowStatus === "ready" ||
    gallery.workflowStatus === "delivered"
  ) {
    return "ready";
  }
  return "editing";
}

export function galleryDetailToFormValues(detail: GalleryDetail): GalleryFormValues {
  const { gallery, meta } = detail;

  return {
    galleryName: gallery.title,
    category: gallery.category,
    description: gallery.description ?? meta.delivery.deliveryNotes ?? "",
    clientId: gallery.clientId ?? meta.clientId,
    relatedBookingId: gallery.relatedBookingId ?? "",
    visibility: meta.settings.visibility,
    allowDownloads: meta.settings.allowDownloads,
    allowFavorites: meta.settings.allowFavorites,
    socialSharing: meta.settings.allowSharing,
    statusSegment: mapGalleryToStatusSegment(gallery),
    photoCount: gallery.photoCount,
    storageUsedGb: meta.storageUsedGb,
    storageTotalGb: meta.storageTotalGb,
    workflowStatus: gallery.workflowStatus,
    galleryStatus: gallery.status,
    accessPin: meta.settings.accessPin ?? meta.delivery.accessPin,
  };
}

export function searchGalleries(
  galleries: PhotographerGallery[],
  query: string,
): PhotographerGallery[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return galleries;

  return galleries.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.clientName.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized),
  );
}

export function filterGalleries(
  galleries: PhotographerGallery[],
  category: GalleryCategoryFilter,
  status: GalleryStatusFilter,
  clientId?: string | null,
): PhotographerGallery[] {
  return galleries.filter((gallery) => {
    const categoryMatch =
      category === "all" || gallery.category === category;
    const statusMatch = status === "all" || gallery.status === status;
    const clientMatch = !clientId || gallery.clientId === clientId;
    return categoryMatch && statusMatch && clientMatch;
  });
}

export function sortGalleries(
  galleries: PhotographerGallery[],
  sortBy: GallerySortOption,
): PhotographerGallery[] {
  const sorted = [...galleries];
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "photoCount":
      return sorted.sort((a, b) => b.photoCount - a.photoCount);
    case "dateUploaded":
    default:
      return sorted.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }
}
