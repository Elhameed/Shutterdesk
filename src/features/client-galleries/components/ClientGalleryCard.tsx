import { Link } from "react-router-dom";
import { Eye, ImagePlus, Loader2 } from "lucide-react";
import { AppImage } from "@/components/ui/image";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import { ROUTES } from "@/constants/routes";
import type { PhotographerGallery } from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type ClientGalleryCardProps = {
  gallery: PhotographerGallery;
};

export function ClientGalleryCard({ gallery }: ClientGalleryCardProps) {
  const copy = CLIENT_GALLERIES_COPY;
  const isProcessing = gallery.workflowStatus === "editing";
  const isViewable =
    gallery.workflowStatus === "delivered" ||
    gallery.workflowStatus === "ready";

  const badgeKey =
    gallery.workflowStatus === "delivered"
      ? "delivered"
      : gallery.workflowStatus === "ready"
        ? "ready"
        : "editing";

  const image = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
      <AppImage
        src={gallery.coverImage}
        alt=""
        className={cn(
          "duration-300",
          isProcessing && "scale-105 grayscale",
          isViewable && "group-hover:scale-[1.02]",
        )}
      />

      {!isProcessing && (
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-wide text-charcoal uppercase shadow-sm">
          {copy.badge[badgeKey]}
        </span>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/45">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm">
            <Loader2 className="size-5 animate-spin" aria-hidden />
          </span>
          <p className="mt-3 text-[10px] font-bold tracking-wider text-white uppercase">
            {copy.badge.editing}
          </p>
        </div>
      )}

      {isViewable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-charcoal/0 opacity-0 transition-all group-hover:bg-charcoal/20 group-hover:opacity-100">
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-charcoal shadow-md">
            <Eye className="size-4" aria-hidden />
          </span>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="rounded-b-xl bg-white px-4 py-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-charcoal">{gallery.title}</h3>
        {gallery.isNew ? (
          <span
            className="size-2 shrink-0 rounded-full bg-gold"
            aria-label="New gallery"
          />
        ) : null}
      </div>
      <p className="mt-1 text-xs text-muted">
        {isProcessing
          ? copy.processingSession
          : copy.photos(gallery.photoCount)}
      </p>
    </div>
  );

  if (!isViewable) {
    return (
      <article className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        {image}
        {footer}
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-md">
      <Link
        to={ROUTES.client.galleryDetail(gallery.id)}
        className="block"
        aria-label={`${copy.viewGallery}: ${gallery.title}`}
      >
        {image}
        {footer}
      </Link>
    </article>
  );
}

export function ClientNewSessionCard() {
  const copy = CLIENT_GALLERIES_COPY.newSession;

  return (
    <Link
      to={ROUTES.client.bookSession}
      className="group flex min-h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-white px-6 py-10 text-center shadow-card transition-colors hover:border-gold/40 hover:bg-gray-50/80"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-gray-100 text-muted transition-colors group-hover:bg-gold/10 group-hover:text-gold">
        <ImagePlus className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-xs font-bold tracking-wider text-muted uppercase">
        {copy.title}
      </p>
      <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-muted">
        {copy.body}
      </p>
    </Link>
  );
}
