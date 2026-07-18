import { useEffect, useState } from "react";
import { ClientNotFoundState } from "@/components/common/ClientNotFoundState";
import { ClientBookingDetailHeader } from "@/features/client-booking-detail/components/ClientBookingDetailHeader";
import { ClientBookingProfileCard } from "@/features/client-booking-detail/components/ClientBookingProfileCard";
import { ClientBookingTimelineCard } from "@/features/client-booking-detail/components/ClientBookingTimelineCard";
import { ClientPackageDetailsCard } from "@/features/client-booking-detail/components/ClientPackageDetailsCard";
import { ClientPaymentStatusCard } from "@/features/client-booking-detail/components/ClientPaymentStatusCard";
import { ClientSessionDetailsCard } from "@/features/client-booking-detail/components/ClientSessionDetailsCard";
import { ClientVenueHeroCard } from "@/features/client-booking-detail/components/ClientVenueHeroCard";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { clientApi } from "@/services/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DetailPageSkeleton } from "@/components/skeletons";
import type { Booking, BookingDetail } from "@/types/domains/booking";

type ClientBookingDetailViewProps = {
  bookingId: string;
};

export function ClientBookingDetailView({
  bookingId,
}: ClientBookingDetailViewProps) {
  const copy = CLIENT_BOOKINGS_COPY;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      try {
        const [bookingData, detailData] = await Promise.all([
          clientApi.bookings.getById(bookingId),
          clientApi.bookings.getDetail(bookingId),
        ]);
        if (!cancelled) {
          setBooking(bookingData ?? null);
          setDetail(detailData ?? null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Unable to load booking."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (showSkeleton) {
    return <DetailPageSkeleton />;
  }

  if (isLoading) {
    return null;
  }

  if (error || !booking || !detail) {
    return (
      <ClientNotFoundState
        message={error ?? copy.notFound}
        actionLabel={copy.backToBookings}
        actionHref={ROUTES.client.bookings}
      />
    );
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <ClientBookingDetailHeader detail={detail} />

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-6">
          <ClientBookingTimelineCard
            timeline={detail.timeline}
            status={detail.detailStatus}
          />
          <ClientVenueHeroCard
            venue={detail.event.venue}
            image={detail.package.coverImage}
          />
        </div>

        <div className="min-w-0 space-y-6">
          <ClientBookingProfileCard client={detail.client} />
          <ClientSessionDetailsCard event={detail.event} />
          <ClientPackageDetailsCard packageInfo={detail.package} />
          <ClientPaymentStatusCard
            payment={detail.payment}
            bookingId={detail.id}
            paymentPending={detail.showVerifyPayment}
          />
        </div>
      </div>
    </div>
  );
}
