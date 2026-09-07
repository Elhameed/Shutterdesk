import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { photographerApi } from "@/services/photographer";
import type { SettingsPanel } from "@/types/domains/settings";

/**
 * Read hooks for the photographer portal.
 *
 * These replace the `useState` + `useEffect` + `loadX()` triple that 28 views
 * were each writing out by hand. Beyond the repetition, the hand-rolled version
 * gave up caching, request deduplication and refetch-on-focus, and made every
 * mutation responsible for remembering to re-call its loader.
 *
 * `meta.errorMessage` is the copy a view shows when the query fails, so the
 * message lives with the query rather than being repeated at each call site.
 */

export function usePhotographerDashboard() {
  return useQuery({
    queryKey: queryKeys.photographer.dashboard,
    queryFn: () => photographerApi.dashboard.getSummary(),
    refetchOnWindowFocus: true,
    meta: { errorMessage: "Unable to load your dashboard." },
  });
}

export function usePhotographerActivity(filters?: {
  type?: string;
  range?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: queryKeys.photographer.activity(filters),
    queryFn: () => photographerApi.activity.list(filters),
    meta: { errorMessage: "Unable to load activity." },
  });
}

export function usePhotographerAnalytics(range?: string) {
  return useQuery({
    queryKey: queryKeys.photographer.analytics(range),
    queryFn: () => photographerApi.analytics.getSummary(range),
    meta: { errorMessage: "Unable to load analytics." },
  });
}

export function usePhotographerBookings() {
  return useQuery({
    queryKey: queryKeys.photographer.bookings,
    queryFn: () => photographerApi.bookings.list(),
    meta: { errorMessage: "Unable to load bookings." },
  });
}

export function usePhotographerBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photographer.bookingDetail(id ?? ""),
    queryFn: () => photographerApi.bookings.getDetail(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this booking." },
  });
}

export function usePhotographerGalleries() {
  return useQuery({
    queryKey: queryKeys.photographer.galleries,
    queryFn: () => photographerApi.galleries.list(),
    meta: { errorMessage: "Unable to load galleries." },
  });
}

export function usePhotographerGalleryDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photographer.galleryDetail(id ?? ""),
    queryFn: () => photographerApi.galleries.getDetail(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this gallery." },
  });
}

export function usePhotographerClients() {
  return useQuery({
    queryKey: queryKeys.photographer.clients,
    queryFn: () => photographerApi.clients.list(),
    meta: { errorMessage: "Unable to load clients." },
  });
}

export function usePhotographerClientProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photographer.clientProfile(id ?? ""),
    queryFn: () => photographerApi.clients.getProfile(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this client." },
  });
}

export function usePhotographerServices() {
  return useQuery({
    queryKey: queryKeys.photographer.services,
    queryFn: () => photographerApi.services.list(),
    meta: { errorMessage: "Unable to load service packages." },
  });
}

export function usePhotographerServiceDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photographer.serviceDetail(id ?? ""),
    queryFn: () => photographerApi.services.getById(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this service package." },
  });
}

export function usePhotographerVerifications() {
  return useQuery({
    queryKey: queryKeys.photographer.verifications,
    queryFn: () => photographerApi.payments.list(),
    meta: { errorMessage: "Unable to load payment verifications." },
  });
}

export function usePhotographerCalendar(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.photographer.calendar(month, year),
    queryFn: () => photographerApi.calendar.getMonth(month, year),
    meta: { errorMessage: "Unable to load your calendar." },
  });
}

export function usePhotographerAvailability() {
  return useQuery({
    queryKey: queryKeys.photographer.availability,
    queryFn: () => photographerApi.availability.getSchedule(),
    meta: { errorMessage: "Unable to load your availability." },
  });
}

export function usePhotographerSettings(panel: SettingsPanel) {
  return useQuery({
    queryKey: queryKeys.photographer.settings(panel),
    queryFn: () => photographerApi.settings.getPanel(panel),
    meta: { errorMessage: "Unable to load settings." },
  });
}
