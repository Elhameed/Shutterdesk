import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDefaultGalleryFormValues, type GalleryFormValues } from "@/types/domains/gallery";
import { GalleryFormView } from "@/features/photographer-gallery-create/components/GalleryFormView";
import { photographerApi } from "@/services/photographer";

export function CreateGalleryView() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking") ?? "";
  const clientId = searchParams.get("client") ?? "";
  const [initialValues, setInitialValues] = useState<GalleryFormValues | null>(
    bookingId ? null : getDefaultGalleryFormValues(clientId),
  );

  useEffect(() => {
    if (bookingId) {
      let cancelled = false;

      void photographerApi.bookings.getDetail(bookingId).then((detail) => {
        if (cancelled) return;

        if (!detail) {
          setInitialValues(getDefaultGalleryFormValues(clientId));
          return;
        }

        setInitialValues({
          ...getDefaultGalleryFormValues(detail.clientId ?? ""),
          galleryName: `${detail.package.title} — ${detail.event.date}`,
          relatedBookingId: bookingId,
          clientId: detail.clientId ?? "",
        });
      });

      return () => {
        cancelled = true;
      };
    }

    setInitialValues(getDefaultGalleryFormValues(clientId));
  }, [bookingId, clientId]);

  if (!initialValues) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="text-sm text-muted">Preparing gallery form…</p>
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
