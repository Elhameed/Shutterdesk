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
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-md bg-paper-dim">
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
        <span className="absolute top-3 left-3 rounded-full bg-panel px-3 py-1 text-[10px] font-medium text-ink">
          {copy.badge[badgeKey]}
        </span>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/45">
          <span className="flex size-11 items-center justify-center rounded-full bg-panel/95 text-ink">
            <Loader2 className="size-5 animate-spin" aria-hidden />
          </span>
          <p className="mt-3 text-[10px] font-medium text-white">
            {copy.badge.editing}
          </p>
        </div>
      )}

      {isViewable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all group-hover:bg-ink/20 group-hover:opacity-100">
          <span className="flex size-10 items-center justify-center rounded-full bg-panel text-ink shadow-md">
            <Eye className="size-4" aria-hidden />
          </span>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="rounded-b-md bg-panel px-4 py-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-ink">{gallery.title}</h3>
        {gallery.isNew ? (
          <span
            className="size-2 shrink-0 rounded-full bg-accent"
            aria-label="New gallery"
          />
        ) : null}
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        {isProcessing
          ? copy.processingSession
          : copy.photos(gallery.photoCount)}
      </p>
    </div>
  );

  if (!isViewable) {
    return (
      <article className="overflow-hidden rounded-md border border-border bg-panel">
        {image}
        {footer}
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-md border border-border bg-panel transition-colors hover:border-border-strong">
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
      className="group flex min-h-full flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-panel px-6 py-10 text-center transition-colors hover:border-accent/40 hover:bg-paper-dim/80"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-paper-dim text-ink-soft transition-colors group-hover:bg-accent-hover/10 group-hover:text-accent">
        <ImagePlus className="size-6" aria-hidden />
      </span>
      <p className="mt-4 text-xs font-medium text-ink-soft">
        {copy.title}
      </p>
      <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-ink-soft">
        {copy.body}
      </p>
    </Link>
  );
}
