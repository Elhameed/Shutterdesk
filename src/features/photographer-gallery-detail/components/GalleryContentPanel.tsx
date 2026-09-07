import { type RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
  GALLERIES_COPY,
  type GalleryDetailTab,
} from "@/constants/photographer-galleries";
import { GalleryAnalyticsTab } from "@/features/photographer-gallery-detail/components/GalleryAnalyticsTab";
import { GalleryDeliveryTab } from "@/features/photographer-gallery-detail/components/GalleryDeliveryTab";
import { GalleryPhotoGrid } from "@/features/photographer-gallery-detail/components/GalleryPhotoGrid";
import { GalleryPhotoUploadPanel } from "@/features/photographer-gallery-detail/components/GalleryPhotoUploadPanel";
import { GallerySettingsTab } from "@/features/photographer-gallery-detail/components/GallerySettingsTab";
import type {
  GalleryDetailMeta,
  GalleryPhoto,
  PhotographerGallery,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

const tabs: GalleryDetailTab[] = [
  "photos",
  "delivery",
  "analytics",
  "settings",
];

type GalleryContentPanelProps = {
  gallery: PhotographerGallery;
  meta: GalleryDetailMeta;
  photos: GalleryPhoto[];
  totalPhotos: number;
  hasMore: boolean;
  onLoadMore: () => void;
  photoCount: number;
  uploadPanelRef?: RefObject<HTMLDivElement | null>;
  onPhotosUploaded: (secureUrls: string[]) => Promise<void>;
  isUploadingPhotos?: boolean;
  activeTab: GalleryDetailTab;
  onTabChange: (tab: GalleryDetailTab) => void;
  allPhotos: GalleryPhoto[];
  isPhotoActionLoading?: boolean;
  onDeletePhoto?: (photoId: string) => Promise<void>;
  onUpdatePhoto?: (
    photoId: string,
    input: { alt?: string; assetKey?: string },
  ) => Promise<void>;
  onReorderPhotos?: (photoIds: string[]) => Promise<void>;
};

export function GalleryContentPanel({
  gallery,
  meta,
  photos,
  totalPhotos,
  hasMore,
  onLoadMore,
  photoCount,
  uploadPanelRef,
  onPhotosUploaded,
  isUploadingPhotos = false,
  activeTab,
  onTabChange,
  allPhotos,
  isPhotoActionLoading = false,
  onDeletePhoto,
  onUpdatePhoto,
  onReorderPhotos,
}: GalleryContentPanelProps) {
  const copy = GALLERIES_COPY.detail;
  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-5 sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors",
                activeTab === tab
                  ? "border-border-strong text-ink"
                  : "border-transparent text-ink-soft hover:text-ink",
              )}
            >
              {copy.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Was a storage bar reading "X GB / 50 GB used", where X was
            photoCount x 0.025 rather than any measured size. */}
        <div className="shrink-0 pb-3 sm:min-w-[160px] sm:text-right">
          <p className="text-xs font-bold text-ink">{copy.photoCount(photoCount)}</p>
        </div>
      </div>

      <div className="mt-5">
        {activeTab === "photos" && (
          <>
            <div ref={uploadPanelRef}>
              <GalleryPhotoUploadPanel
                onUpload={onPhotosUploaded}
                disabled={isUploadingPhotos}
                className="mb-5"
              />
            </div>
            <GalleryPhotoGrid
              photos={photos}
              allPhotos={allPhotos}
              disabled={isUploadingPhotos || isPhotoActionLoading}
              onDeletePhoto={onDeletePhoto}
              onUpdatePhoto={onUpdatePhoto}
              onReorderPhotos={onReorderPhotos}
            />

            {hasMore && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  className="min-w-[220px] rounded-md"
                  onClick={onLoadMore}
                >
                  {copy.loadMorePhotos}
                </Button>
                <p className="text-xs text-ink-soft">
                  {copy.showingPhotos(photos.length, totalPhotos)}
                </p>
              </div>
            )}

            {!hasMore && photos.length > 0 && (
              <p className="mt-6 text-center text-xs text-ink-soft">
                {copy.showingPhotos(photos.length, totalPhotos)}
              </p>
            )}
          </>
        )}

        {activeTab === "delivery" && (
          <GalleryDeliveryTab
            gallery={gallery}
            delivery={meta.delivery}
          />
        )}

        {activeTab === "analytics" && (
          <GalleryAnalyticsTab
            analytics={meta.analytics}
            activities={meta.activities}
          />
        )}

        {activeTab === "settings" && (
          <GallerySettingsTab gallery={gallery} settings={meta.settings} />
        )}
      </div>
    </section>
  );
}
