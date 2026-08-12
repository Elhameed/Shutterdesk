import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import { GalleryPhotoLightbox } from "@/features/photographer-gallery-detail/components/GalleryPhotoLightbox";
import { downloadGalleryPhotoFromUrl } from "@/features/photographer-gallery-detail/lib/download-gallery-photo";
import { clientApi } from "@/services/client";
import {
  GALLERY_PHOTOS_PAGE_SIZE,
  type GalleryPhoto,
} from "@/types/domains/gallery";

type ClientGalleryPhotoMasonryProps = {
  galleryId: string;
  photos: GalleryPhoto[];
  downloadEnabled?: boolean;
  accessPin?: string;
};

export function ClientGalleryPhotoMasonry({
  galleryId,
  photos,
  downloadEnabled = false,
  accessPin,
}: ClientGalleryPhotoMasonryProps) {
  const copy = CLIENT_GALLERIES_COPY.detail;
  const [visibleCount, setVisibleCount] = useState(GALLERY_PHOTOS_PAGE_SIZE * 3);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = visibleCount < photos.length;

  function openPhoto(photo: GalleryPhoto) {
    const index = photos.findIndex((item) => item.id === photo.id);
    if (index >= 0) {
      setViewerIndex(index);
    }
  }

  async function handleDownloadPhoto(photo: GalleryPhoto) {
    const download = await clientApi.galleries.getPhotoDownloadUrl(
      galleryId,
      photo.id,
      accessPin,
    );
    if (!download) {
      return;
    }

    await downloadGalleryPhotoFromUrl(download);
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        {copy.noPhotosFound}
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted lg:hidden">{copy.tapToView}</p>
      <div className="columns-2 gap-4 sm:columns-3">
        {visiblePhotos.map((photo) => (
          <article
            key={photo.id}
            className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl ring-1 ring-gold/60"
          >
            <button
              type="button"
              className="block w-full touch-manipulation text-left"
              onClick={() => openPhoto(photo)}
              aria-label={`${copy.viewPhoto}: ${photo.alt}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </button>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-2 rounded-b-xl bg-linear-to-t from-charcoal/70 via-charcoal/25 to-transparent p-3 opacity-100 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              {downloadEnabled ? (
                <Tooltip label={copy.downloadPhoto} side="top">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDownloadPhoto(photo);
                    }}
                    className="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-md transition-colors hover:bg-white lg:size-9"
                    aria-label={copy.downloadPhoto}
                  >
                    <Download className="size-4" aria-hidden />
                  </button>
                </Tooltip>
              ) : null}
              <Tooltip label={copy.viewPhoto} side="top">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openPhoto(photo);
                  }}
                  className="pointer-events-auto hidden size-9 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-md transition-colors hover:bg-white lg:flex"
                  aria-label={copy.viewPhoto}
                >
                  <Eye className="size-4" aria-hidden />
                </button>
              </Tooltip>
            </div>
          </article>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount((count) => count + GALLERY_PHOTOS_PAGE_SIZE * 3)
            }
          >
            {copy.loadMore}
          </Button>
        </div>
      ) : null}

      {viewerIndex !== null ? (
        <GalleryPhotoLightbox
          photos={photos}
          activeIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
          downloadEnabled={downloadEnabled}
          downloadLabel={copy.downloadPhoto}
          onDownloadPhoto={(photo) => void handleDownloadPhoto(photo)}
        />
      ) : null}
    </>
  );
}
