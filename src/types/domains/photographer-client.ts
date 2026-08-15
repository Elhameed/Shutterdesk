export type ClientTier = "vip" | "active" | "new";
export type ClientCategory = "wedding" | "commercial" | "portrait" | "editorial";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  banner: string | null;
  tier: ClientTier;
  category: ClientCategory;
  sessions: number;
  revenue: number;
  balance: number;
  lastBooking: string;
  dateAdded: string;
};

export type ClientTimelineType =
  | "upcoming"
  | "gallery"
  | "payment"
  | "feedback"
  | "onboarded";

export type ClientTimelineEvent = {
  id: string;
  type: ClientTimelineType;
  title: string;
  subtitle?: string;
  date: string;
  highlighted?: boolean;
  linkText?: string;
  quote?: string;
  rating?: number;
};

export type ClientProjectStatus = "completed" | "upcoming";

export type ClientProject = {
  id: string;
  bookingId?: string;
  status: ClientProjectStatus;
  category: string;
  title: string;
  date: string;
  photoCount?: number;
  time?: string;
  coverImage: string;
};

export type ClientInvoiceStatus = "paid" | "pending";

export type ClientInvoice = {
  id: string;
  number: string;
  description: string;
  date: string;
  amount: number;
  status: ClientInvoiceStatus;
};

export type ClientGalleryPrivacy = "private" | "public";

export type ClientGallery = {
  id: string;
  title: string;
  itemCount: number;
  privacy: ClientGalleryPrivacy;
  coverImage: string;
};

export type ClientProfileDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  tier: ClientTier;
  rating: "excellent" | "good";
  financial: {
    totalRevenue: number;
    balance: number;
    sessions: number;
    reliability: number;
    memberSince: string;
  };
  insights: {
    retention: string;
    favType: string;
    avgValue: number;
  };
  preferences: {
    primaryContact: string;
    artisticStyles: string[];
    editingPrefs: string;
    specialRequirements: string;
  };
  internalNotes: string | null;
  timeline: ClientTimelineEvent[];
  projects: ClientProject[];
  invoices: ClientInvoice[];
  galleries: ClientGallery[];
};

export type ApiStudioClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarAssetKey: string | null;
  bannerAssetKey: string | null;
  tier: ClientTier;
  category: ClientCategory;
  sessions: number;
  revenue: number;
  balance: number;
  lastBooking: string;
  dateAdded: string;
};

export type ApiClientProfile = ApiStudioClient & {
  location: string;
  rating: "excellent" | "good";
  financial: ClientProfileDetail["financial"];
  insights: ClientProfileDetail["insights"];
  preferences: ClientProfileDetail["preferences"];
  internalNotes: string | null;
  timeline: ClientTimelineEvent[];
  projects: ClientProject[];
  invoices: ClientInvoice[];
  galleries: ClientGallery[];
};
