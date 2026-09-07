import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { photographerApi } from "@/services/photographer";
import type { AddClientInput, CreateBookingInput } from "@/services/photographer";
import type { Booking } from "@/types/domains/booking";
import type { CreateGalleryInput } from "@/types/domains/gallery";
import type { CreateServiceInput } from "@/types/domains/service";

/**
 * Write hooks for the photographer portal.
 *
 * Each invalidates the keys its change affects, which is what replaces the
 * `await loadX()` that every hand-rolled mutation had to remember. Because keys
 * are hierarchical, invalidating a resource's root key also drops any cached
 * detail entries under it.
 *
 * Notifications are invalidated alongside anything that raises one, so the
 * unread badge updates without the view knowing that a notification was sent.
 */

export function useAddClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddClientInput) => photographerApi.clients.add(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.clients,
      });
    },
  });
}

export function useUpdateClientNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      photographerApi.clients.updateNotes(id, notes),
    onSuccess: async (_result, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.clientProfile(id),
      });
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => photographerApi.bookings.create(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.bookings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.dashboard }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.photographer.notifications,
        }),
      ]);
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Booking["status"] }) =>
      photographerApi.bookings.updateStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.bookings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.dashboard }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.photographer.notifications,
        }),
      ]);
    },
  });
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      date,
      time,
    }: {
      id: string;
      date: string;
      time: string;
    }) => photographerApi.bookings.reschedule(id, { date, time }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.bookings }),
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.all }),
      ]);
    },
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGalleryInput) => photographerApi.galleries.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleries,
      });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateGalleryInput> }) =>
      photographerApi.galleries.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleries,
      });
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) => photographerApi.services.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.services,
      });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateServiceInput> }) =>
      photographerApi.services.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.services,
      });
    },
  });
}

export function useDuplicateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => photographerApi.services.duplicate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.services,
      });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => photographerApi.services.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.services,
      });
    },
  });
}

export function useSetGalleryReleaseOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      photographerApi.bookings.setGalleryReleaseOverride(id, enabled),
    onSuccess: async (_result, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.photographer.bookingDetail(id),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.photographer.bookings }),
      ]);
    },
  });
}

export function useUpdateVerificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => photographerApi.payments.updateStatus(id, status),
    onSuccess: async () => {
      // Approving a payment can also confirm the booking and change the
      // dashboard totals, so the whole photographer tree is invalidated.
      await queryClient.invalidateQueries({ queryKey: queryKeys.photographer.all });
    },
  });
}

export function useRequestReceiptResubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => photographerApi.payments.requestResubmission(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.photographer.all });
    },
  });
}

/**
 * Gallery photo operations.
 *
 * Each of these returns a fresh gallery detail, which the view used to push
 * into local state. Invalidating the detail key instead means the parent and
 * every tab see the same updated gallery without anything being passed around.
 */
export function useUploadGalleryPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryId,
      photos,
    }: {
      galleryId: string;
      photos: Array<{ assetKey: string; thumbnailAssetKey?: string; alt?: string }>;
    }) => photographerApi.galleries.uploadPhotos(galleryId, photos),
    onSuccess: async (_result, { galleryId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, photoId }: { galleryId: string; photoId: string }) =>
      photographerApi.galleries.deletePhoto(galleryId, photoId),
    onSuccess: async (_result, { galleryId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

export function useUpdateGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryId,
      photoId,
      input,
    }: {
      galleryId: string;
      photoId: string;
      input: { alt?: string; assetKey?: string };
    }) => photographerApi.galleries.updatePhoto(galleryId, photoId, input),
    onSuccess: async (_result, { galleryId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

export function useReorderGalleryPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ galleryId, photoIds }: { galleryId: string; photoIds: string[] }) =>
      photographerApi.galleries.reorderPhotos(galleryId, photoIds),
    onSuccess: async (_result, { galleryId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

export function useUpdateGalleryDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      galleryId,
      input,
    }: {
      galleryId: string;
      input: Parameters<typeof photographerApi.galleries.updateDelivery>[1];
    }) => photographerApi.galleries.updateDelivery(galleryId, input),
    onSuccess: async (_result, { galleryId }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

/** Delivering a gallery also moves the linked booking forward. */
export function useDeliverGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (galleryId: string) => photographerApi.galleries.deliver(galleryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.photographer.all });
    },
  });
}

export function useNotifyGalleryClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (galleryId: string) =>
      photographerApi.galleries.notifyClient(galleryId),
    onSuccess: async (_result, galleryId) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleryDetail(galleryId),
      });
    },
  });
}

export function useArchiveGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (galleryId: string) => photographerApi.galleries.archive(galleryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.photographer.galleries,
      });
    },
  });
}
