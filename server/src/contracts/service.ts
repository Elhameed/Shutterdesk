import type { ClientCategory } from "./enums.js";

/**
 * A service package. The client called the category field's type
 * `ServiceCategory`; it is the same `ClientCategory` enum.
 */
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
