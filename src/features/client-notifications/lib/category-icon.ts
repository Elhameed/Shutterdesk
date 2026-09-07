import {
  AlarmClock,
  Bell,
  Banknote,
  CalendarDays,
  CloudDownload,
  Image as ImageIcon,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import type { ClientNotificationCategory } from "@/types/domains/notification";

const dashboardCategoryIcons: Record<ClientNotificationCategory, LucideIcon> = {
  booking: CalendarDays,
  payment: RefreshCw,
  gallery: CloudDownload,
  reminder: AlarmClock,
  general: Bell,
};

const fullPageCategoryIcons: Record<ClientNotificationCategory, LucideIcon> = {
  booking: CalendarDays,
  payment: Banknote,
  gallery: ImageIcon,
  reminder: CalendarDays,
  general: Bell,
};

function resolveIcon(
  icons: Record<ClientNotificationCategory, LucideIcon>,
  category: string,
): LucideIcon {
  return icons[category as ClientNotificationCategory] ?? Bell;
}

export function getClientDashboardNotificationIcon(category: string): LucideIcon {
  return resolveIcon(dashboardCategoryIcons, category);
}

export function getClientNotificationIcon(category: string): LucideIcon {
  return resolveIcon(fullPageCategoryIcons, category);
}
