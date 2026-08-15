import { assetUrl } from "@/lib/asset-url";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  ApiClientProfile,
  ApiStudioClient,
  Client,
  ClientGallery,
  ClientProfileDetail,
  ClientProject,
} from "@/types/domains/photographer-client";

function resolveAsset(assetKey: string | null | undefined, fallback: string) {
  if (!assetKey) return fallback;
  return resolveMediaUrl(assetKey, fallback);
}

const defaultAvatar = assetUrl("app/user-avatar");

/** Stock banner assigned automatically at signup — not a user-uploaded cover. */
export const AUTO_ASSIGNED_CLIENT_BANNER_KEY =
  "landing/gallery/portrait/gallery-portrait-outdoor";

function resolveClientBanner(assetKey: string | null | undefined): string | null {
  if (!assetKey || assetKey === AUTO_ASSIGNED_CLIENT_BANNER_KEY) {
    return null;
  }

  const url = resolveMediaUrl(assetKey, "");
  return url || null;
}

export function mapApiClientToClient(apiClient: ApiStudioClient): Client {
  return {
    id: apiClient.id,
    name: apiClient.name,
    email: apiClient.email,
    phone: apiClient.phone,
    avatar: resolveAsset(apiClient.avatarAssetKey, defaultAvatar),
    banner: resolveClientBanner(apiClient.bannerAssetKey),
    tier: apiClient.tier,
    category: apiClient.category,
    sessions: apiClient.sessions,
    revenue: apiClient.revenue,
    balance: apiClient.balance,
    lastBooking: apiClient.lastBooking,
    dateAdded: apiClient.dateAdded,
  };
}

function mapProjects(projects: ClientProject[]): ClientProject[] {
  return projects.map((project) => ({
    ...project,
    bookingId: project.bookingId ?? project.id,
    coverImage: project.coverImage
      ? resolveMediaUrl(project.coverImage, "")
      : "",
  }));
}

const defaultPreferences: ClientProfileDetail["preferences"] = {
  primaryContact: "Email Only",
  artisticStyles: [],
  editingPrefs: "No editing preferences recorded yet.",
  specialRequirements: "No special requirements noted.",
};

const defaultInsights: ClientProfileDetail["insights"] = {
  retention: "New",
  favType: "Portrait",
  avgValue: 0,
};

function normalizePreferences(
  preferences: ClientProfileDetail["preferences"] | undefined,
): ClientProfileDetail["preferences"] {
  if (!preferences) return defaultPreferences;

  return {
    ...defaultPreferences,
    ...preferences,
    artisticStyles: Array.isArray(preferences.artisticStyles)
      ? preferences.artisticStyles
      : [],
  };
}

function normalizeInsights(
  insights: ClientProfileDetail["insights"] | undefined,
): ClientProfileDetail["insights"] {
  if (!insights) return defaultInsights;

  return {
    ...defaultInsights,
    ...insights,
    avgValue: typeof insights.avgValue === "number" ? insights.avgValue : 0,
  };
}

function mapGalleries(galleries: ClientGallery[]): ClientGallery[] {
  return galleries.map((gallery) => ({
    ...gallery,
    coverImage: gallery.coverImage
      ? resolveMediaUrl(gallery.coverImage, "")
      : "",
  }));
}

export function mapApiProfileToDetail(profile: ApiClientProfile): ClientProfileDetail {
  const client = mapApiClientToClient(profile);

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    avatar: client.avatar,
    location: profile.location,
    tier: client.tier,
    rating: profile.rating,
    financial: profile.financial,
    insights: normalizeInsights(profile.insights),
    preferences: normalizePreferences(profile.preferences),
    internalNotes: profile.internalNotes ?? null,
    timeline: profile.timeline,
    projects: mapProjects(profile.projects),
    invoices: profile.invoices,
    galleries: mapGalleries(profile.galleries),
  };
}
