import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Image,
  User,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS_COPY } from "@/constants/photographer-notifications";
import type {
  NotificationIconType,
  StudioNotification,
} from "@/types/domains/notification";
import { cn } from "@/lib/utils";

const iconMap: Record<NotificationIconType, LucideIcon> = {
  calendar: Calendar,
  payment: DollarSign,
  gallery: Image,
  client: User,
  alert: AlertTriangle,
};

const iconStyles: Record<NotificationIconType, string> = {
  calendar: "bg-accent-tint text-accent",
  payment: "bg-ok-tint text-ok-fg",
  gallery: "bg-paper-dim text-ink",
  client: "bg-accent-tint text-accent-fg",
  alert: "bg-bad-tint text-bad-fg",
};

const categoryTagStyles: Record<StudioNotification["category"], string> = {
  booking: "bg-accent-tint text-accent",
  payment: "bg-paper-dim text-ink",
  gallery: "bg-paper-dim text-ink-soft",
  client: "bg-paper-dim text-ink-soft",
  system: "bg-bad-tint text-bad-fg",
};

const priorityTagStyles: Record<StudioNotification["priority"], string> = {
  high: "bg-bad-tint text-bad-fg",
  medium: "bg-paper-dim text-ink-soft",
  low: "bg-paper-dim text-ink-faint",
};

type NotificationCardProps = {
  notification: StudioNotification;
  onMarkRead: (id: string) => void;
};

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  const copy = NOTIFICATIONS_COPY;
  const Icon = iconMap[notification.icon];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-md border bg-panel transition-colors hover:border-border-strong",
        notification.read ? "border-border" : "border-border border-l-4 border-l-gold",
      )}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-sm",
            iconStyles[notification.icon],
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  categoryTagStyles[notification.category],
                )}
              >
                {copy.categoryTags[notification.category]}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  priorityTagStyles[notification.priority],
                )}
              >
                {copy.priorityTags[notification.priority]}
              </span>
            </div>
            <time className="shrink-0 text-xs text-ink-soft">
              {notification.timestamp}
            </time>
          </div>

          <h3 className="mt-3 text-sm font-bold text-ink">
            {notification.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {notification.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {notification.primaryAction.href ? (
              <Button variant="default" size="sm" asChild>
                <Link
                  to={notification.primaryAction.href}
                  onClick={() => onMarkRead(notification.id)}
                >
                  {notification.primaryAction.label}
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => onMarkRead(notification.id)}
              >
                {notification.primaryAction.label}
              </Button>
            )}

            {notification.secondaryAction &&
              (notification.secondaryAction.variant === "link" ? (
                <button
                  type="button"
                  className="px-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  {notification.secondaryAction.label}
                </button>
              ) : notification.secondaryAction.href ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to={notification.secondaryAction.href}>
                    {notification.secondaryAction.label}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  {notification.secondaryAction.label}
                </Button>
              ))}
          </div>
        </div>
      </div>
    </article>
  );
}
