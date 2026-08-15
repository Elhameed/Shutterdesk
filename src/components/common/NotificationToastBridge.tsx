import { useEffect, useRef } from "react";
import { useAuth } from "@/app/AuthProvider";
import { useToast } from "@/components/ui/toast";
import {
  useClientNotifications,
  usePhotographerNotifications,
} from "@/hooks/queries/notifications";
import {
  clientNotificationToToast,
  studioNotificationToToast,
} from "@/lib/notification-toast";

export function NotificationToastBridge() {
  const { user, isAuthenticated } = useAuth();
  const { push } = useToast();
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const roleRef = useRef<string | null>(null);

  const isPhotographer = user?.role === "photographer";
  const isClient = user?.role === "client";

  const photographerQuery = usePhotographerNotifications(
    isAuthenticated && isPhotographer,
  );
  const clientQuery = useClientNotifications(isAuthenticated && isClient);

  const activeQuery = isPhotographer
    ? photographerQuery
    : isClient
      ? clientQuery
      : null;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      seenIdsRef.current.clear();
      initializedRef.current = false;
      roleRef.current = null;
      return;
    }

    if (roleRef.current !== user.role) {
      seenIdsRef.current.clear();
      initializedRef.current = false;
      roleRef.current = user.role;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const notifications = activeQuery?.data;
    if (!notifications || !isAuthenticated) return;

    if (!initializedRef.current) {
      for (const notification of notifications) {
        seenIdsRef.current.add(notification.id);
      }
      initializedRef.current = true;
      return;
    }

    for (const notification of notifications) {
      if (seenIdsRef.current.has(notification.id)) {
        continue;
      }

      seenIdsRef.current.add(notification.id);

      const toast =
        "message" in notification
          ? clientNotificationToToast(notification)
          : studioNotificationToToast(notification);

      push(toast);
    }
  }, [activeQuery?.data, isAuthenticated, push]);

  return null;
}
