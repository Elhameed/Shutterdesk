import type { ClientCategory, ClientTier } from "./enums.js";

/**
 * A CRM client as the API returns it.
 *
 * The server called this `ApiClient` and the client called it
 * `ApiStudioClient` — the same payload under two names, which is how the two
 * copies were able to drift without anyone noticing.
 */
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

export type ClientFinancialSummary = {
  totalRevenue: number;
  balance: number;
  sessions: number;
  reliability: number;
  memberSince: string;
};

export type ClientInsights = {
  retention: string;
  favType: string;
  avgValue: number;
};

export type ClientPreferences = {
  primaryContact: string;
  artisticStyles: string[];
  editingPrefs: string;
  specialRequirements: string;
};

/**
 * The four collections here were `unknown[]` on the server while the client
 * already described them properly, so the client's shapes are what the contract
 * records.
 */
export type ApiClientProfile = ApiStudioClient & {
  location: string;
  rating: "excellent" | "good";
  financial: ClientFinancialSummary;
  insights: ClientInsights;
  preferences: ClientPreferences;
  internalNotes: string | null;
  timeline: ClientTimelineEvent[];
  projects: ClientProject[];
  invoices: ClientInvoice[];
  galleries: ClientGallery[];
};
