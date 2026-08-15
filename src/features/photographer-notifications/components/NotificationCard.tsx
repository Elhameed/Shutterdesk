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
  calendar: "bg-gold-light text-gold",
  payment: "bg-green-50 text-green-700",
  gallery: "bg-gray-100 text-charcoal",
  client: "bg-blue-50 text-blue-700",
  alert: "bg-red-50 text-red-600",
};

const categoryTagStyles: Record<StudioNotification["category"], string> = {
  booking: "bg-gold-light text-gold",
  payment: "bg-gray-100 text-charcoal",
  gallery: "bg-gray-100 text-muted",
  client: "bg-gray-100 text-muted",
  system: "bg-red-50 text-red-600",
};

const priorityTagStyles: Record<StudioNotification["priority"], string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-gray-100 text-muted",
  low: "bg-gray-100 text-muted-light",
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
        "overflow-hidden rounded-xl border bg-white shadow-card transition-shadow hover:shadow-md",
        notification.read ? "border-border" : "border-border border-l-4 border-l-gold",
      )}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
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
                  "rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  categoryTagStyles[notification.category],
                )}
              >
                {copy.categoryTags[notification.category]}
              </span>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  priorityTagStyles[notification.priority],
                )}
              >
                {copy.priorityTags[notification.priority]}
              </span>
            </div>
            <time className="shrink-0 text-xs text-muted">
              {notification.timestamp}
            </time>
          </div>

          <h3 className="mt-3 text-sm font-bold text-charcoal">
            {notification.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
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
                  className="px-2 text-sm font-semibold text-muted transition-colors hover:text-charcoal"
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
