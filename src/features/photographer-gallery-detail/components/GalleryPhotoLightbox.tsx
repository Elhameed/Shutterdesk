import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import type { GalleryPhoto } from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryPhotoLightboxProps = {
  photos: GalleryPhoto[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  downloadEnabled?: boolean;
  downloadLabel?: string;
  onDownloadPhoto?: (photo: GalleryPhoto) => void | Promise<void>;
};

export function GalleryPhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
  downloadEnabled = false,
  downloadLabel = "Download",
  onDownloadPhoto,
}: GalleryPhotoLightboxProps) {
  const copy = GALLERIES_COPY.detail.lightbox;
  const photo = photos[activeIndex];
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < photos.length - 1;

  const goPrevious = useCallback(() => {
    if (hasPrevious) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrevious, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious, onClose]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/95">
      <button
        type="button"
        className="absolute inset-0"
        aria-label={copy.close}
        onClick={onClose}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:size-10"
        aria-label={copy.close}
      >
        <X className="size-5" />
      </button>

      {downloadEnabled && onDownloadPhoto ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void onDownloadPhoto(photo);
          }}
          className="absolute top-4 left-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-lg transition-colors hover:bg-gray-50 sm:min-h-10"
          aria-label={downloadLabel}
        >
          <Download className="size-4" aria-hidden />
          {downloadLabel}
        </button>
      ) : null}

      <p className="absolute top-5 left-1/2 z-20 -translate-x-1/2 text-sm font-medium text-white/80">
        {copy.counter(activeIndex + 1, photos.length)}
      </p>

      {hasPrevious && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goPrevious();
          }}
          className="absolute top-1/2 left-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
          aria-label={copy.previous}
        >
          <ChevronLeft className="size-6" />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
          className="absolute top-1/2 right-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
          aria-label={copy.next}
        >
          <ChevronRight className="size-6" />
        </button>
      )}

      <div
        className="relative z-10 flex max-h-[85vh] max-w-[92vw] items-center justify-center px-14 sm:max-w-[85vw] sm:px-20"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 overflow-x-auto px-4 pb-4">
        <div className="mx-auto flex max-w-3xl justify-center gap-2">
          {photos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onNavigate(index);
              }}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                index === activeIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80",
              )}
              aria-label={copy.viewPhoto(index + 1)}
            >
              <img
                src={item.src}
                alt=""
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
