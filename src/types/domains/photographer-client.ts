import type {
  ApiClientProfile,
  ApiStudioClient,
  ClientCategory,
  ClientGallery,
  ClientGalleryPrivacy,
  ClientInvoice,
  ClientInvoiceStatus,
  ClientProject,
  ClientProjectStatus,
  ClientTier,
  ClientTimelineEvent,
  ClientTimelineType,
} from "@contracts/index.js";

export type {
  ApiClientProfile,
  ApiStudioClient,
  ClientCategory,
  ClientGallery,
  ClientGalleryPrivacy,
  ClientInvoice,
  ClientInvoiceStatus,
  ClientProject,
  ClientProjectStatus,
  ClientTier,
  ClientTimelineEvent,
  ClientTimelineType,
};

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
