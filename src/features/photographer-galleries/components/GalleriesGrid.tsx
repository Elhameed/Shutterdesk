import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { GalleryCard } from "@/features/photographer-galleries/components/GalleryCard";
import type { PhotographerGallery } from "@/types/domains/gallery";

type GalleriesGridProps = {
  galleries: PhotographerGallery[];
  emptyMessage?: string;
};

export function GalleriesGrid({ galleries, emptyMessage }: GalleriesGridProps) {
  if (galleries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        {emptyMessage ?? GALLERIES_COPY.noGalleriesFound}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {galleries.map((gallery) => (
        <GalleryCard key={gallery.id} gallery={gallery} />
      ))}
    </div>
  );
}
