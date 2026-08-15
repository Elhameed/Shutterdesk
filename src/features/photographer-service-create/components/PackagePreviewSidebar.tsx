import { Check, Clock, Image as ImageIcon, Lightbulb } from "lucide-react";
import { SERVICE_CREATE_COPY } from "@/constants/photographer-service-create";

type PackagePreviewSidebarProps = {
  packageName: string;
  price: number;
  durationLabel: string;
  editedPhotos: number;
  includes: string[];
  coverImage?: string | null;
  hasCoverImage?: boolean;
  footerNote?: string;
};

export function PackagePreviewSidebar({
  packageName,
  price,
  durationLabel,
  editedPhotos,
  includes,
  coverImage,
  hasCoverImage = false,
  footerNote,
}: PackagePreviewSidebarProps) {
  const copy = SERVICE_CREATE_COPY;

  return (
    <aside className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <p className="border-b border-border px-5 py-4 text-sm font-bold text-charcoal">
          {copy.packagePreview}
        </p>

        <div className="relative h-40">
          {hasCoverImage && coverImage ? (
            <img
              src={coverImage}
              alt=""
              className="size-full object-cover"
              aria-hidden
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-100">
              <ImageIcon className="size-10 text-muted-light" aria-hidden />
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-gold-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-charcoal uppercase">
            {copy.preview}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-charcoal">
              {packageName || copy.defaultPackageName}
            </h3>
            <p className="text-base font-bold text-charcoal">
              {copy.priceDisplay(price)}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {durationLabel}
            </span>
            <span aria-hidden>•</span>
            <span className="flex items-center gap-1.5">
              <ImageIcon className="size-3.5" />
              {editedPhotos} Photos
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-charcoal"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-green-500"
                  strokeWidth={3}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-center text-[10px] font-medium tracking-wider text-muted-light uppercase">
            {footerNote ?? copy.autoSaved}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border border-l-4 border-l-gold bg-gray-50 p-4">
        <div className="flex gap-3">
          <Lightbulb className="size-5 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="text-sm font-bold text-charcoal">{copy.proTipTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {copy.proTipBody}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}
