import { CloudUpload, Eye, Share2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import {
  GALLERY_CATEGORY_BADGE_STYLES,
  GALLERY_WORKFLOW_BADGE_STYLES,
} from "@/constants/status-colors";
import type { PhotographerGallery } from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryDetailHeroProps = {
  gallery: PhotographerGallery;
  onUploadClick?: () => void;
};

export function GalleryDetailHero({ gallery, onUploadClick }: GalleryDetailHeroProps) {
  const copy = GALLERIES_COPY;
  const detail = copy.detail;

  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="relative h-56 sm:h-64 lg:h-72">
        {gallery.isPlaceholder || !gallery.coverImage ? (
          <div className="size-full bg-gray-300" aria-hidden />
        ) : (
          <img
            src={gallery.coverImage}
            alt={gallery.title}
            className="size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal/90 via-charcoal/40 to-charcoal/20" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  GALLERY_CATEGORY_BADGE_STYLES[gallery.category],
                )}
              >
                {copy.categories[gallery.category]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  GALLERY_WORKFLOW_BADGE_STYLES[gallery.workflowStatus],
                )}
              >
                <span className="size-1.5 rounded-full bg-gold" aria-hidden />
                {copy.workflowStatus[gallery.workflowStatus]}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {gallery.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <User className="size-4 shrink-0" aria-hidden />
              {detail.client(gallery.clientName)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline-light"
              size="sm"
              className="gap-2 border-white/30 bg-white/10 backdrop-blur-sm"
            >
              <Eye className="size-4" />
              {detail.preview}
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              className="gap-2 border-white/30 bg-white/10 backdrop-blur-sm"
            >
              <Share2 className="size-4" />
              {detail.share}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              type="button"
              onClick={onUploadClick}
            >
              <CloudUpload className="size-4" />
              {detail.uploadPhotos}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
