/**
 * Query keys for every cached resource, in one place.
 *
 * Keys are hierarchical so a broad invalidation catches the narrow ones:
 * invalidating `["photographer", "galleries"]` also drops every
 * `["photographer", "galleries", "detail", id]` entry, because TanStack Query
 * matches keys by prefix. That is what lets a mutation invalidate a whole
 * resource without having to know which detail pages happen to be cached.
 *
 * Each list/detail pair is a function so the key and its arguments stay
 * together — the previous file only had eight flat keys, and every other query
 * in the app invented its own inline.
 */

const photographer = ["photographer"] as const;
const client = ["client"] as const;

export const queryKeys = {
  photographer: {
    all: photographer,

    dashboard: [...photographer, "dashboard"] as const,
    activity: (filters?: { type?: string; range?: string; page?: number }) =>
      [...photographer, "activity", filters ?? {}] as const,
    analytics: (range?: string) =>
      [...photographer, "analytics", range ?? "all"] as const,

    bookings: [...photographer, "bookings"] as const,
    bookingDetail: (id: string) =>
      [...photographer, "bookings", "detail", id] as const,

    galleries: [...photographer, "galleries"] as const,
    galleryDetail: (id: string) =>
      [...photographer, "galleries", "detail", id] as const,

    clients: [...photographer, "clients"] as const,
    clientProfile: (id: string) =>
      [...photographer, "clients", "profile", id] as const,

    services: [...photographer, "services"] as const,
    serviceDetail: (id: string) =>
      [...photographer, "services", "detail", id] as const,

    payments: [...photographer, "payments"] as const,
    verifications: [...photographer, "payments", "verifications"] as const,

    calendar: (month: number, year: number) =>
      [...photographer, "calendar", { month, year }] as const,
    availability: [...photographer, "availability"] as const,

    notifications: [...photographer, "notifications"] as const,
    settings: (panel: string) => [...photographer, "settings", panel] as const,
  },

  client: {
    all: client,

    dashboard: [...client, "dashboard"] as const,

    bookings: [...client, "bookings"] as const,
    bookingDetail: (id: string) => [...client, "bookings", "detail", id] as const,

    galleries: [...client, "galleries"] as const,
    galleryDetail: (id: string) => [...client, "galleries", "detail", id] as const,

    payments: [...client, "payments"] as const,
    paymentRequests: [...client, "payments", "requests"] as const,
    paymentRequest: (id: string) => [...client, "payments", "requests", id] as const,
    outstanding: [...client, "payments", "outstanding"] as const,
    studioPaymentProfile: (slug: string) =>
      [...client, "payments", "studio-profile", slug] as const,

    studios: [...client, "studios"] as const,
    studioServices: (slug: string) => [...client, "studios", slug, "services"] as const,
    services: [...client, "services"] as const,

    availabilityDates: (params: {
      studioSlug: string;
      packageId: string;
      month: number;
      year: number;
    }) => [...client, "availability", "dates", params] as const,
    availabilitySlots: (params: {
      studioSlug: string;
      packageId: string;
      date: string;
    }) => [...client, "availability", "slots", params] as const,

    notifications: [...client, "notifications"] as const,
    settings: [...client, "settings"] as const,
  },
} as const;
