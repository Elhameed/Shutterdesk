import { apiClient } from "@/lib/api-client";
import { assetUrl } from "@/lib/asset-url";
import {
  mapApiGallery,
  mapApiGalleryDetailMeta,
  mapApiGalleryPhoto,
} from "@/services/gallery-mapper";
import type {
  ApiGallery,
  ApiGalleryPhoto,
  GalleryDetail,
  GalleryDetailMeta,
  GalleryPhoto,
  PhotographerGallery,
} from "@/types/domains/gallery";

type ListResponse = { data: ApiGallery[] };
type DetailResponse = {
  data: {
    gallery: ApiGallery;
    meta: GalleryDetailMeta;
    photos: ApiGalleryPhoto[];
  };
};
type DownloadResponse = { data: { assetKey: string; alt: string } };
type DownloadPackageResponse = {
  data: {
    photos: Array<{ id: string; assetKey: string; alt: string }>;
  };
};

function resolvePhotoSrc(assetKey: string) {
  return assetKey.startsWith("http") || assetKey.startsWith("data:")
    ? assetKey
    : assetUrl(assetKey) ?? assetKey;
}

function galleryAccessHeaders(accessPin?: string) {
  return accessPin ? { "X-Gallery-Access-Pin": accessPin } : undefined;
}

export const clientGalleriesHttp = {
  async list(): Promise<PhotographerGallery[]> {
    const { data } = await apiClient.get<ListResponse>("/client/galleries");
    return data.data.map(mapApiGallery);
  },

  async getById(id: string): Promise<PhotographerGallery | undefined> {
    try {
      const detail = await this.getDetail(id);
      return detail?.gallery;
    } catch {
      return undefined;
    }
  },

  async getDetail(id: string, accessPin?: string): Promise<GalleryDetail | undefined> {
    try {
      const { data } = await apiClient.get<DetailResponse>(`/client/galleries/${id}`, {
        headers: galleryAccessHeaders(accessPin),
      });
      return {
        gallery: mapApiGallery(data.data.gallery),
        meta: mapApiGalleryDetailMeta(data.data.meta),
        photos: data.data.photos.map(mapApiGalleryPhoto),
      };
    } catch {
      return undefined;
    }
  },

  async verifyPin(galleryId: string, pin: string): Promise<boolean> {
    await apiClient.post(`/client/galleries/${galleryId}/verify-pin`, { pin });
    return true;
  },

  async getPhotoDownloadUrl(
    galleryId: string,
    photoId: string,
    accessPin?: string,
  ): Promise<GalleryPhoto | undefined> {
    try {
      const { data } = await apiClient.get<DownloadResponse>(
        `/client/galleries/${galleryId}/photos/${photoId}/download`,
        { headers: galleryAccessHeaders(accessPin) },
      );
      const assetKey = data.data.assetKey;
      const src = resolvePhotoSrc(assetKey);

      return {
        id: photoId,
        src,
        alt: data.data.alt,
      };
    } catch {
      return undefined;
    }
  },

  async prepareDownload(galleryId: string, accessPin?: string): Promise<GalleryPhoto[]> {
    const { data } = await apiClient.post<DownloadPackageResponse>(
      `/client/galleries/${galleryId}/download`,
      undefined,
      { headers: galleryAccessHeaders(accessPin) },
    );

    return data.data.photos.map((photo) => ({
      id: photo.id,
      src: resolvePhotoSrc(photo.assetKey),
      alt: photo.alt,
    }));
  },
};
