import { useState } from "react";
import { InlineAlert } from "@/components/common/InlineAlert";
import { Download } from "lucide-react";
import { ClientNotFoundState } from "@/components/common/ClientNotFoundState";
import { PortalBreadcrumbs } from "@/components/common/PortalBreadcrumbs";
import { Button } from "@/components/ui/button";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import { ROUTES } from "@/constants/routes";
import { ClientCuratedHighlightsBanner } from "@/features/client-gallery-detail/components/ClientCuratedHighlightsBanner";
import { ClientGalleryInfoCard } from "@/features/client-gallery-detail/components/ClientGalleryInfoCard";
import { ClientGalleryPhotoMasonry } from "@/features/client-gallery-detail/components/ClientGalleryPhotoMasonry";
import { ClientGalleryPinGate } from "@/features/client-gallery-detail/components/ClientGalleryPinGate";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  clearStoredGalleryAccessPin,
  getStoredGalleryAccessPin,
  storeGalleryAccessPin,
} from "@/lib/gallery-access-session";
import { downloadGalleryAsZip } from "@/lib/download-gallery-zip";
import { clientApi } from "@/services/client";
import { useClientGalleryDetail } from "@/hooks/queries/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { Skeleton } from "@/components/skeletons";

type ClientGalleryDetailViewProps = {
  galleryId: string;
};

export function ClientGalleryDetailView({
  galleryId,
}: ClientGalleryDetailViewProps) {
  const copy = CLIENT_GALLERIES_COPY;
  const [accessPin, setAccessPin] = useState<string | undefined>(() =>
    getStoredGalleryAccessPin(galleryId),
  );
  // The PIN is part of the key, so entering one refetches the gallery with it
  // rather than the view calling a loader again by hand.
  const { data: detail = null, isPending } = useClientGalleryDetail(
    galleryId,
    accessPin,
  );
  const showSkeleton = useDelayedLoading(isPending);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (showSkeleton) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <div
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          role="status"
          aria-busy
          aria-label="Loading gallery"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isPending) {
    return null;
  }

  if (!detail) {
    return (
      <ClientNotFoundState
        message={copy.notFound}
        actionLabel={copy.backToGalleries}
        actionHref={ROUTES.client.galleries}
      />
    );
  }

  const { gallery, meta, photos } = detail;
  const delivery = meta.delivery;
  const pinRequired = delivery.pinRequired && !delivery.pinVerified;
  const isExpired = Boolean(delivery.expired);

  if (isExpired) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <PortalBreadcrumbs
          items={[
            { label: copy.detail.backToGalleries, href: ROUTES.client.galleries },
            { label: gallery.title },
          ]}
          className="mb-4"
        />
        <div className="rounded-md border border-border bg-panel p-8 text-center">
          <h1 className="text-xl font-bold text-ink">{copy.detail.expiredTitle}</h1>
          <p className="mt-2 text-sm text-ink-soft">{copy.detail.galleryExpired}</p>
        </div>
      </div>
    );
  }

  if (pinRequired) {
    return (
      <ClientGalleryPinGate
        galleryId={galleryId}
        galleryTitle={gallery.title}
        onVerified={(pin) => {
          storeGalleryAccessPin(galleryId, pin);
          setAccessPin(pin);
        }}
      />
    );
  }

  const subtitle = `${gallery.photoCount} photos · ${gallery.uploadedDate}`;

  async function handleDownloadGallery() {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress({ completed: 0, total: photos.length });

    try {
      const downloadPhotos = await clientApi.galleries.prepareDownload(
        galleryId,
        accessPin,
      );
      await downloadGalleryAsZip(gallery.title, downloadPhotos, (completed, total) => {
        setDownloadProgress({ completed, total });
      });
    } catch (error) {
      const message = getApiErrorMessage(error, copy.detail.downloadFailed);
      setDownloadError(message);
      if (message.toLowerCase().includes("pin")) {
        clearStoredGalleryAccessPin(galleryId);
        setAccessPin(undefined);
      }
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }

  const downloadLabel = isDownloading
    ? downloadProgress
      ? copy.detail.preparingZipProgress(
          downloadProgress.completed,
          downloadProgress.total,
        )
      : copy.detail.preparingZip
    : copy.detail.downloadGallery;

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalBreadcrumbs
        items={[
          { label: copy.detail.backToGalleries, href: ROUTES.client.galleries },
          { label: gallery.title },
        ]}
        className="mb-4"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {gallery.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
        </div>

        {delivery.downloadEnabled ? (
          <Button
            variant="outline"
            className="shrink-0"
            size="sm"
            disabled={isDownloading || photos.length === 0}
            onClick={() => void handleDownloadGallery()}
          >
            <Download className="size-4" aria-hidden />
            {downloadLabel}
          </Button>
        ) : null}
      </div>

      {downloadError ? (
        <InlineAlert className="mt-4">{downloadError}</InlineAlert>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <ClientGalleryInfoCard delivery={delivery} />
        <ClientCuratedHighlightsBanner
          coverImage={gallery.coverImage || photos[0]?.src}
          showNewBadge={gallery.isNew}
        />
      </div>

      <div className="mt-8">
        <ClientGalleryPhotoMasonry
          galleryId={galleryId}
          photos={photos}
          downloadEnabled={delivery.downloadEnabled}
          accessPin={accessPin}
        />
      </div>
    </div>
  );
}
