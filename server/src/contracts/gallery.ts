import type {
  GalleryCategory,
  GalleryStatus,
  GalleryWorkflowStatus,
} from "./enums.js";

export type GalleryVisibility = "public" | "private" | "password";

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
  /** Photographer view only — the client is told whether a PIN is needed, not what it is. */
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

/**
 * Only what the API actually measures. Unique visitors, session duration,
 * engagement rate, the weekly chart and per-photo rankings were synthesised
 * from formulas rather than tracked, and were removed rather than shown as if
 * they were real.
 */
export type GalleryAnalyticsData = {
  totalViews: number;
  totalDownloads: number;
};

export type GallerySettingsData = {
  visibility: GalleryVisibility;
  allowSharing: boolean;
  allowFavorites: boolean;
  allowDownloads: boolean;
  showPhotographerCredit: boolean;
  emailNotifications: boolean;
  /** `null` means the gallery never expires. */
  expirationDate: string | null;
  accessPin?: string;
  slug: string;
};

/**
 * The three blobs here were `Record<string, unknown>` and `unknown[]` on the
 * server side while the client already described them properly, so the client's
 * shapes are what the contract records.
 */
export type ApiGalleryDetailMeta = {
  clientId: string;
  clientEmail: string;
  clientInitials: string;
  shootDate: string;
  location: string;
  activities: GalleryActivity[];
  delivery: GalleryDeliveryData;
  analytics: GalleryAnalyticsData;
  settings: GallerySettingsData;
};
