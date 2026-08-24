import {
  Bell,
  CalendarDays,
  CreditCard,
  HardDrive,
  Image,
  Shield,
  SlidersHorizontal,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  SETTINGS_COPY,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/constants/photographer-settings";
import { DEFAULT_STORAGE_SETTINGS } from "@/constants/storage";
import { cn } from "@/lib/utils";

const tabIcons: Record<SettingsTab, LucideIcon> = {
  profile: User,
  studio: SlidersHorizontal,
  payment: CreditCard,
  notifications: Bell,
  gallery: Image,
  booking: CalendarDays,
  security: Shield,
  billing: HardDrive,
};

type SettingsNavProps = {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

export function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  const copy = SETTINGS_COPY;

  return (
    <aside className="flex min-h-full flex-col">
      <nav className="overflow-x-auto p-3 lg:overflow-visible">
        <div className="flex gap-1 lg:flex-col">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:w-full",
                  isActive
                    ? "bg-gray-100 text-charcoal"
                    : "text-muted hover:bg-gray-50 hover:text-charcoal",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    isActive ? "text-gold" : "text-muted",
                  )}
                  aria-hidden
                />
                {copy.tabs[tab]}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-muted-light uppercase">
          <span>{copy.storage.label}</span>
          <span className="text-charcoal">{DEFAULT_STORAGE_SETTINGS.percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-charcoal transition-all"
            style={{ width: `${DEFAULT_STORAGE_SETTINGS.percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {copy.storage.used(
            DEFAULT_STORAGE_SETTINGS.usedGb,
            DEFAULT_STORAGE_SETTINGS.totalGb,
          )}
        </p>
      </div>
    </aside>
  );
}
