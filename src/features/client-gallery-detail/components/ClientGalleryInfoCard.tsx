import { CheckCircle2, LockKeyhole } from "lucide-react";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import type { GalleryDeliveryData } from "@/types/domains/gallery";

type ClientGalleryInfoCardProps = {
  delivery: GalleryDeliveryData;
};

export function ClientGalleryInfoCard({ delivery }: ClientGalleryInfoCardProps) {
  const copy = CLIENT_GALLERIES_COPY.detail;

  return (
    <section className="flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
        {copy.galleryInformation}
      </h2>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted">{copy.accessPin}</dt>
          <dd className="mt-1 flex items-center gap-2 text-lg font-bold text-charcoal">
            {delivery.pinRequired ? (
              <>
                <LockKeyhole className="size-4 text-gold" aria-hidden />
                {copy.pinRequired}
              </>
            ) : (
              copy.privateAccess
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{copy.expires}</dt>
          <dd className="mt-1 text-lg font-bold text-charcoal">{delivery.expiresAt}</dd>
        </div>
      </dl>

      <div className="mt-auto border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          {delivery.downloadEnabled
            ? copy.downloadsEnabled
            : copy.downloadsDisabled}
        </p>
      </div>
    </section>
  );
}
