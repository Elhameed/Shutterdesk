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
