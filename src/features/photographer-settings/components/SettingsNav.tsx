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
import {
  PANEL_NAV_ITEM,
  panelNavItemState,
} from "@/components/layout/rail-nav";
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
                  PANEL_NAV_ITEM,
                  panelNavItemState(isActive),
                  "lg:w-full",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    isActive ? "text-accent" : "text-ink-faint",
                  )}
                  aria-hidden
                />
                {copy.tabs[tab]}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-border mt-auto border-t p-4">
        <div className="text-ink-soft flex items-center justify-between text-xs">
          <span>{copy.storage.label}</span>
          <span className="font-display text-ink">
            {DEFAULT_STORAGE_SETTINGS.percent}%
          </span>
        </div>
        <div className="bg-paper-dim mt-2 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full rounded-full transition-all"
            style={{ width: `${DEFAULT_STORAGE_SETTINGS.percent}%` }}
          />
        </div>
        <p className="text-ink-faint mt-2 text-xs">
          {copy.storage.used(
            DEFAULT_STORAGE_SETTINGS.usedGb,
            DEFAULT_STORAGE_SETTINGS.totalGb,
          )}
        </p>
      </div>
    </aside>
  );
}
