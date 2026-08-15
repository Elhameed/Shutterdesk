import { Mail, MailOpen } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NOTIFICATIONS_COPY,
  type NotificationCategory,
  type NotificationStatusFilter,
} from "@/constants/photographer-notifications";
import { cn } from "@/lib/utils";

type NotificationsSidebarProps = {
  activeStatus: NotificationStatusFilter;
  counts: { all: number; unread: number; read: number };
  categories: Record<NotificationCategory, boolean>;
  onStatusChange: (status: NotificationStatusFilter) => void;
  onCategoryChange: (category: NotificationCategory, checked: boolean) => void;
};

const statusItems: {
  key: NotificationStatusFilter;
  icon?: typeof Mail;
}[] = [
  { key: "all" },
  { key: "unread", icon: MailOpen },
  { key: "read", icon: Mail },
];

const categoryItems: NotificationCategory[] = [
  "booking",
  "payment",
  "gallery",
  "client",
  "system",
];

export function NotificationsSidebar({
  activeStatus,
  counts,
  categories,
  onStatusChange,
  onCategoryChange,
}: NotificationsSidebarProps) {
  const copy = NOTIFICATIONS_COPY;

  return (
    <aside className="space-y-6 rounded-xl border border-border bg-white p-5 shadow-card lg:sticky lg:top-6">
      <section>
        <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {copy.status}
        </p>
        <div className="mt-3 space-y-1">
          {statusItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onStatusChange(key)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                activeStatus === key
                  ? "bg-gold text-charcoal"
                  : "text-charcoal hover:bg-gray-50",
              )}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="size-4" aria-hidden />}
                {copy.statusFilters[key]}
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  activeStatus === key ? "text-charcoal" : "text-muted",
                )}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {copy.categories}
        </p>
        <div className="mt-3 space-y-3">
          {categoryItems.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-charcoal"
            >
              <Checkbox
                checked={categories[category]}
                onChange={(event) =>
                  onCategoryChange(category, event.target.checked)
                }
              />
              {copy.categoryFilters[category]}
            </label>
          ))}
        </div>
      </section>
    </aside>
  );
}
