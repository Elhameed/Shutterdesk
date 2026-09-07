import { Link } from "react-router-dom";
import { CLIENT_NOTIFICATIONS_COPY } from "@/constants/client-notifications";
import { getClientNotificationIcon } from "@/features/client-notifications/lib/category-icon";
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
        "rounded-md p-4 sm:p-5",
        notification.read
          ? "border border-border bg-panel"
          : "border border-accent/20 border-l-4 border-l-gold bg-accent-tint/40",
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            notification.read
              ? "bg-paper-dim text-ink-soft"
              : "bg-panel text-accent",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2
              className={cn(
                "text-sm font-bold",
                notification.read ? "text-ink-soft" : "text-ink",
              )}
            >
              {notification.title}
            </h2>
            <time className="shrink-0 text-xs text-ink-faint">
              {notification.timestamp}
            </time>
          </div>

          <p
            className={cn(
              "mt-1 text-sm",
              notification.read ? "text-ink-faint" : "text-ink-soft",
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
                    ? "text-ink-soft transition-colors hover:text-ink"
                    : "text-accent transition-colors hover:text-accent-hover",
                )}
              >
                {actionText}
              </Link>
            ) : null}

            {!notification.read ? (
              <>
                {notification.href ? (
                  <span className="text-ink-faint" aria-hidden>
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  className="text-ink-soft transition-colors hover:text-ink"
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
