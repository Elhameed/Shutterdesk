import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  GALLERIES_COPY,
  type GalleryDetailTab,
} from "@/constants/photographer-galleries";
import { ROUTES } from "@/constants/routes";
import { GalleryContentPanel } from "@/features/photographer-gallery-detail/components/GalleryContentPanel";
import { GalleryDetailBreadcrumbs } from "@/features/photographer-gallery-detail/components/GalleryDetailBreadcrumbs";
import { GalleryDetailHero } from "@/features/photographer-gallery-detail/components/GalleryDetailHero";
import { GalleryDetailSidebar } from "@/features/photographer-gallery-detail/components/GalleryDetailSidebar";
import { downloadGalleryReportFile } from "@/features/photographer-gallery-detail/lib/download-gallery-report";
import { photographerApi } from "@/services/photographer";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  GALLERY_PHOTOS_PAGE_SIZE,
  type GalleryDetail,
} from "@/types/domains/gallery";

type GalleryDetailViewProps = {
  galleryId: string;
};

export function GalleryDetailView({ galleryId }: GalleryDetailViewProps) {
  const copy = GALLERIES_COPY.detail;
  const sidebarCopy = copy.sidebar;
  const { push } = useToast();
  const [detail, setDetail] = useState<GalleryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(GALLERY_PHOTOS_PAGE_SIZE);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<GalleryDetailTab>("photos");
  const [isNotifyLoading, setIsNotifyLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isPhotoActionLoading, setIsPhotoActionLoading] = useState(false);
  const uploadPanelRef = useRef<HTMLDivElement>(null);

  const applyDetailUpdate = useCallback((updated: GalleryDetail) => {
    setDetail(updated);
    setVisibleCount((count) => Math.min(count, updated.photos.length));
  }, []);

  const loadDetail = useCallback(async () => {
    const data = await photographerApi.galleries.getDetail(galleryId);
    setDetail(data ?? null);
    setIsLoading(false);
    return data;
  }, [galleryId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handlePhotosUploaded = useCallback(
    async (secureUrls: string[]) => {
      setIsUploadingPhotos(true);
      try {
        await photographerApi.galleries.uploadPhotos(
          galleryId,
          secureUrls.map((assetKey, index) => ({
            assetKey,
            alt: `Gallery photo ${index + 1}`,
          })),
        );
        const refreshed = await loadDetail();
        if (refreshed) {
          setVisibleCount(refreshed.photos.length);
        }
        push({
          variant: "success",
          title: "Photos uploaded",
          description: `${secureUrls.length} photo(s) added to the gallery.`,
        });
      } catch (error) {
        push({
          variant: "error",
          title: "Upload failed",
          description: getApiErrorMessage(error, "Please try again."),
        });
      } finally {
        setIsUploadingPhotos(false);
      }
    },
    [galleryId, loadDetail, push],
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      setIsPhotoActionLoading(true);
      try {
        const refreshed = await photographerApi.galleries.deletePhoto(
          galleryId,
          photoId,
        );
        applyDetailUpdate(refreshed);
        push({
          variant: "success",
          title: copy.photos.deleted,
        });
      } catch (error) {
        push({
          variant: "error",
          title: "Unable to delete photo",
          description: getApiErrorMessage(error, "Please try again."),
        });
      } finally {
        setIsPhotoActionLoading(false);
      }
    },
    [applyDetailUpdate, copy.photos.deleted, galleryId, push],
  );

  const handleUpdatePhoto = useCallback(
    async (photoId: string, input: { alt?: string; assetKey?: string }) => {
      setIsPhotoActionLoading(true);
      try {
        const refreshed = await photographerApi.galleries.updatePhoto(
          galleryId,
          photoId,
          input,
        );
        applyDetailUpdate(refreshed);
        push({
          variant: "success",
          title: copy.photos.updated,
        });
      } catch (error) {
        push({
          variant: "error",
          title: "Unable to update photo",
          description: getApiErrorMessage(error, "Please try again."),
        });
      } finally {
        setIsPhotoActionLoading(false);
      }
    },
    [applyDetailUpdate, copy.photos.updated, galleryId, push],
  );

  const handleReorderPhotos = useCallback(
    async (photoIds: string[]) => {
      setIsPhotoActionLoading(true);
      try {
        const refreshed = await photographerApi.galleries.reorderPhotos(
          galleryId,
          photoIds,
        );
        applyDetailUpdate(refreshed);
        push({
          variant: "success",
          title: copy.photos.reordered,
        });
      } catch (error) {
        push({
          variant: "error",
          title: "Unable to reorder photos",
          description: getApiErrorMessage(error, "Please try again."),
        });
      } finally {
        setIsPhotoActionLoading(false);
      }
    },
    [applyDetailUpdate, copy.photos.reordered, galleryId, push],
  );

  const scrollToUpload = useCallback(() => {
    uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleNotifyClient = useCallback(async () => {
    setIsNotifyLoading(true);
    try {
      const refreshed = await photographerApi.galleries.notifyClient(galleryId);
      setDetail(refreshed);
      push({
        variant: "success",
        title: sidebarCopy.notifySuccess,
        description: sidebarCopy.notifySuccessDescription,
      });
    } catch (error) {
      push({
        variant: "error",
        title: "Unable to notify client",
        description: getApiErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsNotifyLoading(false);
    }
  }, [galleryId, push, sidebarCopy]);

  const handleExportReport = useCallback(async () => {
    if (!detail) return;

    setIsExportLoading(true);
    try {
      const report = await photographerApi.galleries.exportReport(galleryId);
      downloadGalleryReportFile(detail.gallery.title, report);
      push({
        variant: "success",
        title: sidebarCopy.exportSuccess,
        description: sidebarCopy.exportSuccessDescription,
      });
    } catch (error) {
      push({
        variant: "error",
        title: "Unable to export report",
        description: getApiErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsExportLoading(false);
    }
  }, [detail, galleryId, push, sidebarCopy]);

  const handleArchiveGallery = useCallback(() => {
    if (detail?.gallery.status === "archived") {
      push({
        variant: "info",
        title: sidebarCopy.archiveAlready,
      });
      return;
    }

    setArchiveOpen(true);
  }, [detail?.gallery.status, push, sidebarCopy]);

  const confirmArchiveGallery = useCallback(async () => {
    setIsArchiveLoading(true);
    try {
      const refreshed = await photographerApi.galleries.archive(galleryId);
      setDetail(refreshed);
      setArchiveOpen(false);
      push({
        variant: "success",
        title: sidebarCopy.archiveSuccess,
        description: sidebarCopy.archiveSuccessDescription,
      });
    } catch (error) {
      push({
        variant: "error",
        title: "Unable to archive gallery",
        description: getApiErrorMessage(error, "Please try again."),
      });
    } finally {
      setIsArchiveLoading(false);
    }
  }, [galleryId, push, sidebarCopy]);

  const handleViewAllActivity = useCallback(() => {
    setActiveTab("analytics");
  }, []);

  const visiblePhotos = useMemo(
    () => detail?.photos.slice(0, visibleCount) ?? [],
    [detail, visibleCount],
  );
  const hasMore = (detail?.photos.length ?? 0) > visibleCount;

  if (isLoading) {
    return (
      <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <CardSkeleton />
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-muted">{copy.notFound}</p>
        <Link
          to={ROUTES.photographer.galleries}
          className="text-sm font-semibold text-gold hover:text-gold-hover"
        >
          {copy.backToGalleries}
        </Link>
      </div>
    );
  }

  const { gallery, meta } = detail;

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <GalleryDetailBreadcrumbs galleryTitle={gallery.title} />

      <div className="mt-4">
        <GalleryDetailHero gallery={gallery} onUploadClick={scrollToUpload} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <GalleryContentPanel
          gallery={gallery}
          meta={meta}
          photos={visiblePhotos}
          allPhotos={detail.photos}
          totalPhotos={detail.photos.length}
          hasMore={hasMore}
          onLoadMore={() =>
            setVisibleCount((count) => count + GALLERY_PHOTOS_PAGE_SIZE)
          }
          storageUsedGb={meta.storageUsedGb}
          storageTotalGb={meta.storageTotalGb}
          uploadPanelRef={uploadPanelRef}
          onPhotosUploaded={handlePhotosUploaded}
          isUploadingPhotos={isUploadingPhotos}
          isPhotoActionLoading={isPhotoActionLoading}
          onDeletePhoto={handleDeletePhoto}
          onUpdatePhoto={handleUpdatePhoto}
          onReorderPhotos={handleReorderPhotos}
          onDetailUpdated={applyDetailUpdate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <GalleryDetailSidebar
          gallery={gallery}
          meta={meta}
          isNotifyLoading={isNotifyLoading}
          isExportLoading={isExportLoading}
          isArchiveLoading={isArchiveLoading}
          onNotifyClient={() => void handleNotifyClient()}
          onExportReport={() => void handleExportReport()}
          onArchiveGallery={() => void handleArchiveGallery()}
          onViewAllActivity={handleViewAllActivity}
        />
      </div>

      <AlertDialog
        open={archiveOpen}
        title={sidebarCopy.archiveGallery}
        description={sidebarCopy.archiveConfirm}
        confirmLabel={sidebarCopy.archiveGallery}
        destructive
        isLoading={isArchiveLoading}
        onConfirm={() => void confirmArchiveGallery()}
        onCancel={() => setArchiveOpen(false)}
      />
    </div>
  );
}
