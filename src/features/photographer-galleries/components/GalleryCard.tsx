import {
  Download,
  Eye,
  Heart,
  ImageIcon,
  MoreVertical,
  Pencil,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/image";
import { Tooltip } from "@/components/ui/tooltip";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import {
  GALLERY_FOOTER_STATUS_STYLES,
  GALLERY_WORKFLOW_BADGE_STYLES,
} from "@/constants/status-colors";
import { ROUTES } from "@/constants/routes";
import type { PhotographerGallery } from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryCardProps = {
  gallery: PhotographerGallery;
};

export function GalleryCard({ gallery }: GalleryCardProps) {
  const copy = GALLERIES_COPY;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[5/4] overflow-hidden bg-gray-100">
        <Link
          to={ROUTES.photographer.galleryDetail(gallery.id)}
          className="block size-full"
        >
          {gallery.isPlaceholder ? (
            <div className="flex size-full items-center justify-center bg-gray-100">
              <ImageIcon className="size-10 text-muted-light" aria-hidden />
            </div>
          ) : (
            <AppImage
              src={gallery.coverImage}
              alt={gallery.title}
              className="duration-300 group-hover:scale-[1.02]"
            />
          )}
        </Link>

        <span
          className={cn(
            "absolute top-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
            GALLERY_WORKFLOW_BADGE_STYLES[gallery.workflowStatus],
          )}
        >
          {copy.workflowStatus[gallery.workflowStatus]}
        </span>

        {!gallery.isPlaceholder && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/0 opacity-0 transition-all group-hover:bg-charcoal/25 group-hover:opacity-100">
            <HoverAction icon={Share2} label={copy.share} />
            {!gallery.isPlaceholder && (
              <Link
                to={ROUTES.photographer.galleryEdit(gallery.id)}
                className="pointer-events-auto"
                aria-label={copy.edit}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-charcoal shadow-sm">
                  <Pencil className="size-4" />
                </span>
              </Link>
            )}
            <HoverAction
              icon={Eye}
              label={copy.view}
              to={ROUTES.photographer.galleryDetail(gallery.id)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={ROUTES.photographer.galleryDetail(gallery.id)}
            className="text-sm font-bold text-charcoal hover:text-gold"
          >
            {gallery.title}
          </Link>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-muted transition-colors hover:bg-gray-100 hover:text-charcoal"
            aria-label={copy.moreActions}
          >
            <MoreVertical className="size-4" />
          </button>
        </div>

        <p className="mt-1 text-xs text-muted">{copy.client(gallery.clientName)}</p>
        <p className="mt-1 text-xs text-muted">
          {copy.uploaded}: {gallery.uploadedDate}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted">
            <Stat icon={Eye} value={gallery.views} />
            <Stat icon={Download} value={gallery.downloads} />
            <Stat icon={Heart} value={gallery.likes} />
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold",
              GALLERY_FOOTER_STATUS_STYLES[gallery.workflowStatus],
            )}
          >
            {copy.footerStatus[gallery.workflowStatus]}
          </span>
        </div>
      </div>
    </article>
  );
}

function HoverAction({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof Share2;
  label: string;
  to?: string;
}) {
  const content = (
    <span className="flex size-9 items-center justify-center rounded-full bg-white text-charcoal shadow-sm">
      <Icon className="size-4" />
    </span>
  );

  return (
    <Tooltip label={label}>
      {to ? (
        <Link
          to={to}
          className="pointer-events-auto"
          aria-label={label}
        >
          {content}
        </Link>
      ) : (
        <span
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-white text-charcoal shadow-sm"
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
      )}
    </Tooltip>
  );
}

function Stat({
  icon: Icon,
  value,
}: {
  icon: typeof Eye;
  value: number;
}) {
  return (
    <span className="flex items-center gap-1">
      <Icon className="size-3.5" aria-hidden />
      {value.toLocaleString()}
    </span>
  );
}
