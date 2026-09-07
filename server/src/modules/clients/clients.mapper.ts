import { z } from "zod";
import type { StudioClient } from "@prisma/client";
import type { ClientMetrics } from "../../domain/client-metrics.js";
import type { ClientProfileActivity } from "../../domain/client-profile-activity.js";
import {
  formatDisplayDate,
  formatIsoDate,
  formatMemberSince,
} from "../../format/date-format.js";

import type {
  ApiClientProfile,
  ApiStudioClient,
} from "../../contracts/client.js";

// The server's historic name for the shared ApiStudioClient contract.
export type ApiClient = ApiStudioClient;
export type { ApiStudioClient, ApiClientProfile };

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

/**
 * These four columns are stored as untyped JSON but the API promises real
 * shapes for them, so each entry is validated rather than passed through.
 * Anything that does not match is dropped — the column holds whatever an older
 * version of the app wrote, and a malformed entry should not break the profile.
 */
const clientTimelineSchema = z.object({
  id: z.string(),
  type: z.enum(["upcoming", "gallery", "payment", "feedback", "onboarded"]),
  title: z.string(),
  subtitle: z.string().optional(),
  date: z.string(),
  highlighted: z.boolean().optional(),
  linkText: z.string().optional(),
  quote: z.string().optional(),
  rating: z.number().optional(),
});

const clientProjectSchema = z.object({
  id: z.string(),
  bookingId: z.string().optional(),
  status: z.enum(["completed", "upcoming"]),
  category: z.string(),
  title: z.string(),
  date: z.string(),
  photoCount: z.number().optional(),
  time: z.string().optional(),
  coverImage: z.string(),
});

const clientInvoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  description: z.string(),
  date: z.string(),
  amount: z.number(),
  status: z.enum(["paid", "pending"]),
});

const clientGallerySchema = z.object({
  id: z.string(),
  title: z.string(),
  itemCount: z.number(),
  privacy: z.enum(["private", "public"]),
  coverImage: z.string(),
});

function parseJsonArrayOf<S extends z.ZodType>(
  schema: S,
  value: unknown,
): z.output<S>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    const parsed = schema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

/**
 * `metrics` is required rather than optional because sessions, revenue and
 * balance are always computed from the client's bookings — the columns of the
 * same name on StudioClient were written once at create and never updated.
 * Making it optional let call sites silently fall back to those stale zeroes.
 */
/** A client with no bookings yet. */
export const NO_CLIENT_METRICS: ClientMetrics = {
  sessions: 0,
  revenue: 0,
  balance: 0,
  lastBookingAt: null,
};

export function toApiClient(
  client: StudioClient,
  avatarAssetKey: string | null | undefined,
  metrics: ClientMetrics,
): ApiClient {
  const { sessions, revenue, balance, lastBookingAt } = metrics;

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
  avatarAssetKey: string | null | undefined,
  metrics: ClientMetrics,
  activity?: ClientProfileActivity,
): ApiClientProfile {
  const base = toApiClient(client, avatarAssetKey, metrics);
  // Was `metrics?.balance === 0 ? client.reliability : client.reliability` —
  // both branches were the same value.
  const reliability = activity?.reliability ?? client.reliability;

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
    timeline:
      activity?.timeline ?? parseJsonArrayOf(clientTimelineSchema, client.timeline),
    projects:
      activity?.projects ?? parseJsonArrayOf(clientProjectSchema, client.projects),
    invoices:
      activity?.invoices ?? parseJsonArrayOf(clientInvoiceSchema, client.invoices),
    galleries:
      activity?.galleries ?? parseJsonArrayOf(clientGallerySchema, client.galleries),
  };
}
