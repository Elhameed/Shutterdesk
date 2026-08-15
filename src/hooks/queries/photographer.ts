import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { photographerApi } from "@/services/photographer";

export function usePhotographerDashboard() {
  return useQuery({
    queryKey: queryKeys.photographer.dashboard,
    queryFn: () => photographerApi.dashboard.getSummary(),
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: "Unable to load your dashboard.",
    },
  });
}

export function usePhotographerBookings() {
  return useQuery({
    queryKey: queryKeys.photographer.bookings,
    queryFn: () => photographerApi.bookings.list(),
    meta: {
      errorMessage: "Unable to load bookings.",
    },
  });
}

export function usePhotographerGalleries() {
  return useQuery({
    queryKey: queryKeys.photographer.galleries,
    queryFn: () => photographerApi.galleries.list(),
    meta: {
      errorMessage: "Unable to load galleries.",
    },
  });
}
