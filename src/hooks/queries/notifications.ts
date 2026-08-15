import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { clientApi } from "@/services/client";
import { photographerApi } from "@/services/photographer";
import type {
  ClientNotification,
  StudioNotification,
} from "@/types/domains/notification";

const NOTIFICATION_POLL_INTERVAL_MS = 10_000;

const notificationQueryOptions = {
  refetchOnWindowFocus: true,
  refetchInterval: NOTIFICATION_POLL_INTERVAL_MS,
} as const;

export function useClientNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.client.notifications,
    queryFn: () => clientApi.notifications.list(),
    enabled,
    ...notificationQueryOptions,
  });
}

export function useClientUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.client.notifications,
    queryFn: () => clientApi.notifications.list(),
    enabled,
    select: (notifications) =>
      notifications.filter((notification) => !notification.read).length,
    ...notificationQueryOptions,
  });
}

export function useClientNotificationMutations() {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.client.notifications;

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey });
  }

  const markAllRead = useMutation({
    mutationFn: () => clientApi.notifications.markAllRead(),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => clientApi.notifications.markRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClientNotification[]>(queryKey);
      queryClient.setQueryData<ClientNotification[]>(queryKey, (current) =>
        current?.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: async () => {
      await invalidate();
    },
  });

  return { markAllRead, markRead };
}

export function usePhotographerNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.photographer.notifications,
    queryFn: () => photographerApi.notifications.list(),
    enabled,
    ...notificationQueryOptions,
  });
}

export function usePhotographerUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: queryKeys.photographer.notifications,
    queryFn: () => photographerApi.notifications.list(),
    enabled,
    select: (notifications) =>
      notifications.filter((notification) => !notification.read).length,
    ...notificationQueryOptions,
  });
}

export function usePhotographerNotificationMutations() {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.photographer.notifications;

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey });
  }

  const markAllRead = useMutation({
    mutationFn: () => photographerApi.notifications.markAllRead(),
    onSuccess: async () => {
      await invalidate();
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => photographerApi.notifications.markRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<StudioNotification[]>(queryKey);
      queryClient.setQueryData<StudioNotification[]>(queryKey, (current) =>
        current?.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: async () => {
      await invalidate();
    },
  });

  return { markAllRead, markRead };
}
