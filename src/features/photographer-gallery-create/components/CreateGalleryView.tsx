import { useSearchParams } from "react-router-dom";
import { getDefaultGalleryFormValues } from "@/types/domains/gallery";
import { GalleryFormView } from "@/features/photographer-gallery-create/components/GalleryFormView";
import { usePhotographerBookingDetail } from "@/hooks/queries/photographer";

export function CreateGalleryView() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking") ?? "";
  const clientId = searchParams.get("client") ?? "";

  // Creating a gallery from a booking pre-fills the form from that booking.
  // The query is disabled when there is no booking in the URL, which is what
  // used to be a branch inside the effect.
  const { data: booking, isPending } = usePhotographerBookingDetail(
    bookingId || undefined,
  );

  const initialValues = booking
    ? {
        ...getDefaultGalleryFormValues(booking.clientId ?? ""),
        galleryName: `${booking.package.title} — ${booking.event.date}`,
        relatedBookingId: bookingId,
        clientId: booking.clientId ?? "",
      }
    : getDefaultGalleryFormValues(clientId);

  // Only wait when a booking was actually requested; without one there is
  // nothing to fetch and the defaults are ready immediately.
  if (bookingId && isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-sm text-ink-soft">Preparing gallery form…</p>
      </div>
    );
  }

  return (
    <GalleryFormView
      key={bookingId || clientId || "new"}
      mode="create"
      initialValues={initialValues}
    />
  );
}
