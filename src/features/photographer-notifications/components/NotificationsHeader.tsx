import { Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS_COPY } from "@/constants/photographer-notifications";

type NotificationsHeaderProps = {
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
};

export function NotificationsHeader({
  onMarkAllRead,
  isMarkingAllRead = false,
}: NotificationsHeaderProps) {
  const copy = NOTIFICATIONS_COPY;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{copy.subtitle}</p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead}
        >
          <Check className="size-4" />
          {copy.markAllRead}
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="size-4" />
          {copy.notificationSettings}
        </Button>
      </div>
    </div>
  );
}
