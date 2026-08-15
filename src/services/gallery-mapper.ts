import { assetUrl } from "@/lib/asset-url";
import type {
  ApiGallery,
  ApiGalleryPhoto,
  GalleryDeliveryData,
  GalleryDetailMeta,
  GalleryPhoto,
  PhotographerGallery,
} from "@/types/domains/gallery";

const defaultCover = assetUrl("landing/gallery/wedding/gallery-wedding-couple");

function resolveImage(assetKey: string | null | undefined) {
  if (!assetKey) return defaultCover;
  if (assetKey.startsWith("http") || assetKey.startsWith("data:")) {
    return assetKey;
  }
  return assetUrl(assetKey) || defaultCover;
}

export function mapApiGallery(api: ApiGallery): PhotographerGallery {
  return {
    id: api.id,
    title: api.title,
    clientName: api.clientName,
    category: api.category,
    status: api.status,
    workflowStatus: api.workflowStatus,
    photoCount: api.photoCount,
    coverImage: resolveImage(api.coverAssetKey),
    uploadedDate: api.uploadedDate,
    uploadedAt: api.uploadedAt,
    views: api.views,
    downloads: api.downloads,
    likes: api.likes,
    description: api.description ?? undefined,
    clientId: api.clientId,
    relatedBookingId: api.relatedBookingId ?? undefined,
    isNew: api.isNew,
  };
}

export function mapApiGalleryPhoto(api: ApiGalleryPhoto): GalleryPhoto {
  return {
    id: api.id,
    src: resolveImage(api.thumbnailAssetKey ?? api.assetKey),
    alt: api.alt,
  };
}

export function mapApiGalleryDetailMeta(meta: GalleryDetailMeta): GalleryDetailMeta {
  return {
    ...meta,
    delivery: meta.delivery as GalleryDeliveryData,
  };
}
