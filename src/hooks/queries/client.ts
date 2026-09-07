import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { clientApi } from "@/services/client";
import type { BookingDetail, PaymentRequest } from "@/types/domains/booking";

export type ClientDashboardData = {
  stats: {
    activeBookings: number;
    upcomingSessions: number;
    galleriesAvailable: number;
    pendingPayments: number;
  };
  outstandingTotal: number;
  paymentObligations: PaymentRequest[];
  upcomingDetail?: BookingDetail;
  readyGallery: {
    id: string;
    title: string;
    photoCount: number;
  } | null;
};

async function fetchClientDashboard(): Promise<ClientDashboardData> {
  const summary = await clientApi.dashboard.getSummary();

  const [upcomingDetail, readyGallery] = await Promise.all([
    summary.upcomingBookingId
      ? clientApi.bookings.getDetail(summary.upcomingBookingId)
      : Promise.resolve(undefined),
    summary.readyGalleryId
      ? clientApi.galleries.getById(summary.readyGalleryId)
      : Promise.resolve(undefined),
  ]);

  return {
    stats: summary.stats,
    outstandingTotal: summary.stats.pendingPayments,
    paymentObligations: summary.obligations as unknown as PaymentRequest[],
    upcomingDetail,
    readyGallery: readyGallery
      ? {
          id: readyGallery.id,
          title: readyGallery.title,
          photoCount: readyGallery.photoCount,
        }
      : null,
  };
}

export function useClientDashboard() {
  return useQuery({
    queryKey: queryKeys.client.dashboard,
    queryFn: fetchClientDashboard,
    meta: {
      errorMessage: "Unable to load your dashboard.",
    },
  });
}

export function useClientBookings() {
  return useQuery({
    queryKey: queryKeys.client.bookings,
    queryFn: () => clientApi.bookings.list(),
    meta: {
      errorMessage: "Unable to load bookings.",
    },
  });
}

export function useClientGalleries() {
  return useQuery({
    queryKey: queryKeys.client.galleries,
    queryFn: () => clientApi.galleries.list(),
    meta: {
      errorMessage: "Unable to load galleries.",
    },
  });
}

export function useClientBooking(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.client.bookingDetail(id ?? ""), "summary"],
    queryFn: () => clientApi.bookings.getById(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this booking." },
  });
}

export function useClientBookingDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.client.bookingDetail(id ?? ""),
    queryFn: () => clientApi.bookings.getDetail(id as string),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this booking." },
  });
}

export function useClientGalleryDetail(id: string | undefined, accessPin?: string) {
  return useQuery({
    queryKey: [...queryKeys.client.galleryDetail(id ?? ""), accessPin ?? null],
    queryFn: () => clientApi.galleries.getDetail(id as string, accessPin),
    enabled: Boolean(id),
    meta: { errorMessage: "Unable to load this gallery." },
  });
}

export function useClientPaymentHistory() {
  return useQuery({
    queryKey: queryKeys.client.payments,
    queryFn: () => clientApi.payments.list(),
    meta: { errorMessage: "Unable to load your payments." },
  });
}

export function useClientPaymentRequests() {
  return useQuery({
    queryKey: queryKeys.client.paymentRequests,
    queryFn: () => clientApi.payments.listRequests(),
    meta: { errorMessage: "Unable to load your payment requests." },
  });
}

export function useClientOutstandingSummary() {
  return useQuery({
    queryKey: queryKeys.client.outstanding,
    queryFn: () => clientApi.payments.getOutstandingSummary(),
    meta: { errorMessage: "Unable to load your outstanding balance." },
  });
}

export function useStudioPaymentProfile(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.client.studioPaymentProfile(slug ?? ""),
    queryFn: () => clientApi.payments.getStudioPaymentProfile(slug as string),
    enabled: Boolean(slug),
    meta: { errorMessage: "Unable to load the studio's payment details." },
  });
}

export function useClientStudios() {
  return useQuery({
    queryKey: queryKeys.client.studios,
    queryFn: () => clientApi.studios.list(),
    meta: { errorMessage: "Unable to load studios." },
  });
}

export function useClientStudioServices(studioSlug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.client.studioServices(studioSlug ?? ""),
    queryFn: () => clientApi.services.listPublicByStudio(studioSlug as string),
    enabled: Boolean(studioSlug),
    meta: { errorMessage: "Unable to load this studio's packages." },
  });
}

export function useClientSettings() {
  return useQuery({
    queryKey: queryKeys.client.settings,
    queryFn: () => clientApi.settings.get(),
    meta: { errorMessage: "Unable to load your settings." },
  });
}
