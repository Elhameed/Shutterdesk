import { Link } from "react-router-dom";
import { CLIENT_NOTIFICATIONS_COPY } from "@/constants/client-notifications";
import { getClientNotificationIcon } from "@/features/client-notifications/utils/category-icon";
import type { ClientNotification } from "@/types/domains/notification";
import { cn } from "@/lib/utils";

type ClientNotificationCardProps = {
  notification: ClientNotification;
  onMarkRead: (id: string) => void;
};

export function ClientNotificationCard({
  notification,
  onMarkRead,
}: ClientNotificationCardProps) {
  const copy = CLIENT_NOTIFICATIONS_COPY;
  const Icon = getClientNotificationIcon(notification.category);
  const actionText =
    notification.actionLabel === "getStarted"
      ? copy.getStarted
      : copy.viewDetails;

  return (
    <article
      className={cn(
        "rounded-xl p-4 sm:p-5",
        notification.read
          ? "border border-border bg-white"
          : "border border-gold/20 border-l-4 border-l-gold bg-gold-light/40",
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            notification.read
              ? "bg-gray-100 text-muted"
              : "bg-white text-gold shadow-sm",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2
              className={cn(
                "text-sm font-bold",
                notification.read ? "text-muted" : "text-charcoal",
              )}
            >
              {notification.title}
            </h2>
            <time className="shrink-0 text-xs text-muted-light">
              {notification.timestamp}
            </time>
          </div>

          <p
            className={cn(
              "mt-1 text-sm",
              notification.read ? "text-muted-light" : "text-muted",
            )}
          >
            {notification.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            {notification.href ? (
              <Link
                to={notification.href}
                onClick={() => {
                  if (!notification.read) {
                    onMarkRead(notification.id);
                  }
                }}
                className={cn(
                  notification.read
                    ? "text-muted transition-colors hover:text-charcoal"
                    : "text-gold transition-colors hover:text-gold-hover",
                )}
              >
                {actionText}
              </Link>
            ) : null}

            {!notification.read ? (
              <>
                {notification.href ? (
                  <span className="text-muted-light" aria-hidden>
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  className="text-muted transition-colors hover:text-charcoal"
                >
                  {copy.markRead}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
