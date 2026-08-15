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
