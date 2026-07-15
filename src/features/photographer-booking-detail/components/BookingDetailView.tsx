import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookingDetailHeader } from "@/features/photographer-booking-detail/components/BookingDetailHeader";
import { BookingProgressBar } from "@/features/photographer-booking-detail/components/BookingProgressBar";
import { GalleryStatusCard } from "@/features/photographer-booking-detail/components/GalleryStatusCard";
import { BookingTimelineCard } from "@/features/photographer-booking-detail/components/BookingTimelineCard";
import { ClientProfileCard } from "@/features/photographer-booking-detail/components/ClientProfileCard";
import { EventLogisticsCard } from "@/features/photographer-booking-detail/components/EventLogisticsCard";
import { InternalNotesCard } from "@/features/photographer-booking-detail/components/InternalNotesCard";
import { ManagementCard } from "@/features/photographer-booking-detail/components/ManagementCard";
import { PackageSelectionCard } from "@/features/photographer-booking-detail/components/PackageSelectionCard";
import { PaymentVerificationCard } from "@/features/photographer-booking-detail/components/PaymentVerificationCard";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DetailPageSkeleton } from "@/components/skeletons";
import type { BookingDetail, BookingStatus } from "@/types/domains/booking";

type BookingDetailViewProps = {
  bookingId: string;
};

export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const copy = BOOKING_DETAIL_COPY;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = async (options?: { showLoading?: boolean; cancelled?: () => boolean }) => {
    if (options?.showLoading !== false) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const detail = await photographerApi.bookings.getDetail(bookingId);
      if (!options?.cancelled?.()) {
        setBooking(detail ?? null);
      }
    } catch (loadError) {
      if (!options?.cancelled?.()) {
        setError(getApiErrorMessage(loadError, "Unable to load booking."));
        setBooking(null);
      }
    } finally {
      if (!options?.cancelled?.()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    void loadBooking({ cancelled: () => cancelled });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!booking || isUpdating) return;

    setIsUpdating(true);
    setError(null);
    try {
      await photographerApi.bookings.updateStatus(booking.id, status);
      await loadBooking({ showLoading: false });
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "Unable to update booking."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGalleryReleaseOverride = async () => {
    if (!booking || isUpdating) return;

    setIsUpdating(true);
    setError(null);
    try {
      await photographerApi.bookings.setGalleryReleaseOverride(booking.id, true);
      await loadBooking({ showLoading: false });
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "Unable to update gallery release settings."));
    } finally {
      setIsUpdating(false);
    }
  };

  if (showSkeleton) {
    return <DetailPageSkeleton />;
  }

  if (isLoading) {
    return null;
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-muted">{error ?? copy.notFound}</p>
        <Link
          to={ROUTES.photographer.bookings}
          className="text-sm font-semibold text-gold hover:text-gold-hover"
        >
          {copy.back}
        </Link>
      </div>
    );
  }

  const showGalleryCard =
    booking.lifecycleStage === "awaiting_balance" ||
    booking.lifecycleStage === "session_completed" ||
    booking.lifecycleStage === "gallery_delivery" ||
    Boolean(booking.galleryId);

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <BookingDetailHeader
        booking={booking}
        isUpdating={isUpdating}
        onReject={() => void handleStatusUpdate("cancelled")}
        onMarkComplete={() => void handleStatusUpdate("completed")}
      />

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        <BookingProgressBar currentStep={booking.progressStep} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ClientProfileCard client={booking.client} />
            <EventLogisticsCard event={booking.event} />
          </div>
          <PackageSelectionCard packageInfo={booking.package} />
          <BookingTimelineCard timeline={booking.timeline} />
        </div>

        <div className="space-y-5">
          {showGalleryCard ? (
            <GalleryStatusCard
              bookingId={booking.id}
              galleryId={booking.galleryId}
              currentStage={booking.galleryStep}
              lifecycleStage={booking.lifecycleStage}
              galleryReleaseBlocked={booking.galleryReleaseBlocked}
              galleryReleaseOverride={booking.galleryReleaseOverride}
              onReleaseOverride={() => void handleGalleryReleaseOverride()}
              isOverrideSubmitting={isUpdating}
            />
          ) : null}
          {booking.showVerifyPayment ? (
            <>
              <PaymentVerificationCard booking={booking} />
              <ManagementCard booking={booking} />
            </>
          ) : null}
          <InternalNotesCard />
        </div>
      </div>
    </div>
  );
}
