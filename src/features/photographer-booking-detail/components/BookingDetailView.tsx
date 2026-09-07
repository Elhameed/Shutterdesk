import { useState } from "react";
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
import { getApiErrorMessage, getQueryErrorMessage } from "@/lib/api-error";
import { usePhotographerBookingDetail } from "@/hooks/queries/photographer";
import {
  useSetGalleryReleaseOverride,
  useUpdateBookingStatus,
} from "@/hooks/queries/photographer-mutations";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DetailPageSkeleton } from "@/components/skeletons";
import type { BookingStatus } from "@/types/domains/booking";

type BookingDetailViewProps = {
  bookingId: string;
};

export function BookingDetailView({ bookingId }: BookingDetailViewProps) {
  const copy = BOOKING_DETAIL_COPY;
  const {
    data: booking,
    isPending,
    error: queryError,
  } = usePhotographerBookingDetail(bookingId);

  const updateStatus = useUpdateBookingStatus();
  const setReleaseOverride = useSetGalleryReleaseOverride();

  const showSkeleton = useDelayedLoading(isPending);
  const isUpdating = updateStatus.isPending || setReleaseOverride.isPending;
  const [actionError, setActionError] = useState<string | null>(null);
  const error =
    actionError ??
    (queryError ? getQueryErrorMessage(queryError, "Unable to load booking.") : null);


  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!booking || isUpdating) return;

    setActionError(null);
    try {
      await updateStatus.mutateAsync({ id: booking.id, status });
    } catch (updateError) {
      setActionError(getApiErrorMessage(updateError, "Unable to update booking."));
    }
  };

  const handleGalleryReleaseOverride = async () => {
    if (!booking || isUpdating) return;

    setActionError(null);
    try {
      await setReleaseOverride.mutateAsync({ id: booking.id, enabled: true });
    } catch (updateError) {
      setActionError(
        getApiErrorMessage(updateError, "Unable to update gallery release settings."),
      );
    }
  };

  if (showSkeleton) {
    return <DetailPageSkeleton />;
  }

  if (isPending) {
    return null;
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-ink-soft">{error ?? copy.notFound}</p>
        <Link
          to={ROUTES.photographer.bookings}
          className="text-sm font-semibold text-accent hover:text-accent-hover"
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
    <div className="min-w-0 max-w-full bg-paper-dim/50 p-4 sm:p-6 lg:p-8">
      <BookingDetailHeader
        booking={booking}
        isUpdating={isUpdating}
        onReject={() => void handleStatusUpdate("cancelled")}
        onMarkComplete={() => void handleStatusUpdate("completed")}
      />

      {error ? (
        <p className="mt-4 text-sm text-bad-fg" role="alert">
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
