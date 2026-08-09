import { apiClient } from "@/lib/api-client";
import {
  mapApiGallery,
  mapApiGalleryDetailMeta,
  mapApiGalleryPhoto,
} from "@/services/gallery-mapper";
import type {
  ApiGallery,
  ApiGalleryPhoto,
  CreateGalleryInput,
  GalleryDetail,
  GalleryDetailMeta,
  PhotographerGallery,
} from "@/types/domains/gallery";

type ListResponse = { data: ApiGallery[] };
type ItemResponse = { data: ApiGallery };
type DetailResponse = {
  data: {
    gallery: ApiGallery;
    meta: GalleryDetailMeta;
    photos: ApiGalleryPhoto[];
  };
};

export const photographerGalleriesHttp = {
  async list(): Promise<PhotographerGallery[]> {
    const { data } = await apiClient.get<ListResponse>("/photographer/galleries");
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

  async getDetail(id: string): Promise<GalleryDetail | undefined> {
    try {
      const { data } = await apiClient.get<DetailResponse>(`/photographer/galleries/${id}`);
      return {
        gallery: mapApiGallery(data.data.gallery),
        meta: mapApiGalleryDetailMeta(data.data.meta),
        photos: data.data.photos.map(mapApiGalleryPhoto),
      };
    } catch {
      return undefined;
    }
  },

  async create(input: CreateGalleryInput): Promise<PhotographerGallery> {
    const { data } = await apiClient.post<ItemResponse>("/photographer/galleries", input);
    return mapApiGallery(data.data);
  },

  async update(id: string, input: Partial<CreateGalleryInput>): Promise<PhotographerGallery> {
    const { data } = await apiClient.patch<ItemResponse>(`/photographer/galleries/${id}`, input);
    return mapApiGallery(data.data);
  },

  async uploadPhotos(
    id: string,
    photos: Array<{ assetKey: string; thumbnailAssetKey?: string; alt?: string }>,
  ) {
    const { data } = await apiClient.post<{
      data: { gallery: ApiGallery; photos: ApiGalleryPhoto[] };
    }>(`/photographer/galleries/${id}/photos`, { photos });
    return {
      gallery: mapApiGallery(data.data.gallery),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async deliver(id: string): Promise<PhotographerGallery> {
    const { data } = await apiClient.post<ItemResponse>(`/photographer/galleries/${id}/deliver`);
    return mapApiGallery(data.data);
  },

  async notifyClient(id: string): Promise<GalleryDetail> {
    const { data } = await apiClient.post<DetailResponse>(`/photographer/galleries/${id}/notify-client`);
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async archive(id: string): Promise<GalleryDetail> {
    const { data } = await apiClient.post<DetailResponse>(`/photographer/galleries/${id}/archive`);
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async exportReport(id: string): Promise<Record<string, unknown>> {
    const { data } = await apiClient.get<{ data: Record<string, unknown> }>(
      `/photographer/galleries/${id}/export-report`,
    );
    return data.data;
  },

  async deletePhoto(galleryId: string, photoId: string): Promise<GalleryDetail> {
    const { data } = await apiClient.delete<DetailResponse>(
      `/photographer/galleries/${galleryId}/photos/${photoId}`,
    );
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async updatePhoto(
    galleryId: string,
    photoId: string,
    input: { alt?: string; assetKey?: string },
  ): Promise<GalleryDetail> {
    const { data } = await apiClient.patch<DetailResponse>(
      `/photographer/galleries/${galleryId}/photos/${photoId}`,
      input,
    );
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async reorderPhotos(galleryId: string, photoIds: string[]): Promise<GalleryDetail> {
    const { data } = await apiClient.patch<DetailResponse>(
      `/photographer/galleries/${galleryId}/photos/reorder`,
      { photoIds },
    );
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },

  async updateDelivery(
    galleryId: string,
    input: {
      allowDownloads?: boolean;
      highResDownloads?: boolean;
      watermarkEnabled?: boolean;
      clientNotified?: boolean;
      deliveryNotes?: string;
      accessPin?: string;
      expiresAt?: string;
    },
  ): Promise<GalleryDetail> {
    const { data } = await apiClient.patch<DetailResponse>(
      `/photographer/galleries/${galleryId}/delivery`,
      input,
    );
    return {
      gallery: mapApiGallery(data.data.gallery),
      meta: mapApiGalleryDetailMeta(data.data.meta),
      photos: data.data.photos.map(mapApiGalleryPhoto),
    };
  },
};
