import { useCallback, useMemo, useRef, useState } from "react";
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
import { usePhotographerGalleryDetail } from "@/hooks/queries/photographer";
import {
  useArchiveGallery,
  useDeleteGalleryPhoto,
  useNotifyGalleryClient,
  useReorderGalleryPhotos,
  useUpdateGalleryPhoto,
  useUploadGalleryPhotos,
} from "@/hooks/queries/photographer-mutations";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  GALLERY_PHOTOS_PAGE_SIZE,
} from "@/types/domains/gallery";

type GalleryDetailViewProps = {
  galleryId: string;
};

export function GalleryDetailView({ galleryId }: GalleryDetailViewProps) {
  const copy = GALLERIES_COPY.detail;
  const sidebarCopy = copy.sidebar;
  const { push } = useToast();
  const { data: detail = null, isPending } = usePhotographerGalleryDetail(galleryId);

  const uploadPhotos = useUploadGalleryPhotos();
  const deletePhoto = useDeleteGalleryPhoto();
  const updatePhoto = useUpdateGalleryPhoto();
  const reorderPhotos = useReorderGalleryPhotos();

  const [requestedCount, setRequestedCount] = useState(GALLERY_PHOTOS_PAGE_SIZE);
  // Derived rather than clamped in a setter: when photos are deleted the count
  // has to shrink, and deriving it means there is no stale value to correct.
  const visibleCount = Math.min(requestedCount, detail?.photos.length ?? 0);
  const isUploadingPhotos = uploadPhotos.isPending;
  const [activeTab, setActiveTab] = useState<GalleryDetailTab>("photos");
  const notifyClient = useNotifyGalleryClient();
  const archiveGallery = useArchiveGallery();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const isPhotoActionLoading =
    deletePhoto.isPending || updatePhoto.isPending || reorderPhotos.isPending;
  const uploadPanelRef = useRef<HTMLDivElement>(null);

  const handlePhotosUploaded = useCallback(
    async (secureUrls: string[]) => {
      try {
        const result = await uploadPhotos.mutateAsync({
          galleryId,
          photos: secureUrls.map((assetKey, index) => ({
            assetKey,
            alt: `Gallery photo ${index + 1}`,
          })),
        });
        // Show the newly uploaded photos rather than leaving them behind the
        // "load more" boundary.
        setRequestedCount(result.photos.length);
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
      }
    },
    [galleryId, push, uploadPhotos],
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      try {
        await deletePhoto.mutateAsync({ galleryId, photoId });
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
      }
    },
    [copy.photos.deleted, deletePhoto, galleryId, push],
  );

  const handleUpdatePhoto = useCallback(
    async (photoId: string, input: { alt?: string; assetKey?: string }) => {
      try {
        await updatePhoto.mutateAsync({ galleryId, photoId, input });
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
      }
    },
    [copy.photos.updated, galleryId, push, updatePhoto],
  );

  const handleReorderPhotos = useCallback(
    async (photoIds: string[]) => {
      try {
        await reorderPhotos.mutateAsync({ galleryId, photoIds });
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
      }
    },
    [copy.photos.reordered, galleryId, push, reorderPhotos],
  );

  const scrollToUpload = useCallback(() => {
    uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleNotifyClient = useCallback(async () => {
    try {
      await notifyClient.mutateAsync(galleryId);
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
    }
  }, [galleryId, notifyClient, push, sidebarCopy]);

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
    try {
      await archiveGallery.mutateAsync(galleryId);
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
    }
  }, [archiveGallery, galleryId, push, sidebarCopy]);

  const handleViewAllActivity = useCallback(() => {
    setActiveTab("analytics");
  }, []);

  const visiblePhotos = useMemo(
    () => detail?.photos.slice(0, visibleCount) ?? [],
    [detail, visibleCount],
  );
  const hasMore = (detail?.photos.length ?? 0) > visibleCount;

  if (isPending) {
    return (
      <div className="min-w-0 max-w-full bg-paper-dim/50 p-4 sm:p-6 lg:p-8">
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
        <p className="text-sm text-ink-soft">{copy.notFound}</p>
        <Link
          to={ROUTES.photographer.galleries}
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {copy.backToGalleries}
        </Link>
      </div>
    );
  }

  const { gallery, meta } = detail;

  return (
    <div className="min-w-0 max-w-full bg-paper-dim/50 p-4 sm:p-6 lg:p-8">
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
            setRequestedCount((count) => count + GALLERY_PHOTOS_PAGE_SIZE)
          }
          photoCount={gallery.photoCount}
          uploadPanelRef={uploadPanelRef}
          onPhotosUploaded={handlePhotosUploaded}
          isUploadingPhotos={isUploadingPhotos}
          isPhotoActionLoading={isPhotoActionLoading}
          onDeletePhoto={handleDeletePhoto}
          onUpdatePhoto={handleUpdatePhoto}
          onReorderPhotos={handleReorderPhotos}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <GalleryDetailSidebar
          gallery={gallery}
          meta={meta}
          isNotifyLoading={notifyClient.isPending}
          isExportLoading={isExportLoading}
          isArchiveLoading={archiveGallery.isPending}
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
        isLoading={archiveGallery.isPending}
        onConfirm={() => void confirmArchiveGallery()}
        onCancel={() => setArchiveOpen(false)}
      />
    </div>
  );
}
