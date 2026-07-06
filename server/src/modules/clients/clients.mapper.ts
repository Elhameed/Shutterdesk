import type { StudioClient } from "@prisma/client";
import type { ClientMetrics } from "../../lib/client-metrics.js";
import type { ClientProfileActivity } from "../../lib/client-profile-activity.js";
import {
  formatDisplayDate,
  formatIsoDate,
  formatMemberSince,
} from "../../lib/date-format.js";

export type ApiClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarAssetKey: string | null;
  bannerAssetKey: string | null;
  tier: StudioClient["tier"];
  category: StudioClient["category"];
  sessions: number;
  revenue: number;
  balance: number;
  lastBooking: string;
  dateAdded: string;
};

export type ApiClientProfile = ApiClient & {
  location: string;
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
  timeline: unknown[];
  projects: unknown[];
  invoices: unknown[];
  galleries: unknown[];
};

const defaultPreferences = {
  primaryContact: "Email Only",
  artisticStyles: [] as string[],
  editingPrefs: "No editing preferences recorded yet.",
  specialRequirements: "No special requirements noted.",
};

const defaultInsights = {
  retention: "New",
  favType: "Portrait",
  avgValue: 0,
};

export { defaultPreferences, defaultInsights };

function parseJsonRecord<T extends Record<string, unknown>>(
  value: unknown,
  fallback: T,
): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  return { ...fallback, ...(value as T) };
}

function parsePreferences(value: unknown) {
  const merged = parseJsonRecord(value, defaultPreferences);
  return {
    ...merged,
    artisticStyles: Array.isArray(merged.artisticStyles)
      ? merged.artisticStyles
      : defaultPreferences.artisticStyles,
  };
}

function parseInsights(value: unknown) {
  const merged = parseJsonRecord(value, defaultInsights);
  return {
    ...merged,
    avgValue:
      typeof merged.avgValue === "number" ? merged.avgValue : defaultInsights.avgValue,
  };
}

function parseJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function toApiClient(
  client: StudioClient,
  avatarAssetKey?: string | null,
  metrics?: ClientMetrics,
): ApiClient {
  const sessions = metrics?.sessions ?? client.sessions;
  const revenue = metrics?.revenue ?? client.revenue;
  const balance = metrics?.balance ?? client.balance;
  const lastBookingAt = metrics?.lastBookingAt ?? client.lastBookingAt;

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    avatarAssetKey: avatarAssetKey ?? client.avatarAssetKey,
    bannerAssetKey: client.bannerAssetKey,
    tier: client.tier,
    category: client.category,
    sessions,
    revenue,
    balance,
    lastBooking: lastBookingAt ? formatDisplayDate(lastBookingAt) : "—",
    dateAdded: formatIsoDate(client.createdAt),
  };
}

export function toApiClientProfile(
  client: StudioClient,
  avatarAssetKey?: string | null,
  metrics?: ClientMetrics,
  activity?: ClientProfileActivity,
): ApiClientProfile {
  const base = toApiClient(client, avatarAssetKey, metrics);
  const reliability =
    activity?.reliability ??
    (metrics?.balance === 0 ? client.reliability : client.reliability);

  return {
    ...base,
    location: client.location ?? "Kigali, Rwanda",
    rating:
      activity?.rating ??
      (client.rating === "excellent" ? "excellent" : "good"),
    financial: {
      totalRevenue: base.revenue,
      balance: base.balance,
      sessions: base.sessions,
      reliability,
      memberSince: formatMemberSince(client.memberSince),
    },
    insights: activity?.insights ?? parseInsights(client.insights),
    preferences: parsePreferences(client.preferences),
    internalNotes: client.internalNotes,
    timeline: activity?.timeline ?? parseJsonArray(client.timeline),
    projects: activity?.projects ?? parseJsonArray(client.projects),
    invoices: activity?.invoices ?? parseJsonArray(client.invoices),
    galleries: activity?.galleries ?? parseJsonArray(client.galleries),
  };
}
