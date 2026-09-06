import {
  Download,
  Eye,
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
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-panel transition-colors hover:border-border-strong">
      <div className="relative aspect-[5/4] overflow-hidden bg-paper-dim">
        <Link
          to={ROUTES.photographer.galleryDetail(gallery.id)}
          className="block size-full"
        >
          {gallery.isPlaceholder ? (
            <div className="flex size-full items-center justify-center bg-paper-dim">
              <ImageIcon className="size-10 text-ink-faint" aria-hidden />
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
            "absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-medium",
            GALLERY_WORKFLOW_BADGE_STYLES[gallery.workflowStatus],
          )}
        >
          {copy.workflowStatus[gallery.workflowStatus]}
        </span>

        {!gallery.isPlaceholder && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-ink/0 opacity-0 transition-all group-hover:bg-ink/25 group-hover:opacity-100">
            <HoverAction icon={Share2} label={copy.share} />
            {!gallery.isPlaceholder && (
              <Link
                to={ROUTES.photographer.galleryEdit(gallery.id)}
                className="pointer-events-auto"
                aria-label={copy.edit}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-panel text-ink">
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
            className="text-sm font-bold text-ink hover:text-accent"
          >
            {gallery.title}
          </Link>
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
            aria-label={copy.moreActions}
          >
            <MoreVertical className="size-4" />
          </button>
        </div>

        <p className="mt-1 text-xs text-ink-soft">{copy.client(gallery.clientName)}</p>
        <p className="mt-1 text-xs text-ink-soft">
          {copy.uploaded}: {gallery.uploadedDate}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <Stat icon={Eye} value={gallery.views} />
            <Stat icon={Download} value={gallery.downloads} />
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
    <span className="flex size-9 items-center justify-center rounded-full bg-panel text-ink">
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
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-panel text-ink"
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
