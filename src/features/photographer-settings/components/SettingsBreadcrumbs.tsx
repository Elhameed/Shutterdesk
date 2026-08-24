import { ChevronRight } from "lucide-react";
import { SETTINGS_COPY, type SettingsTab } from "@/constants/photographer-settings";

type SettingsBreadcrumbsProps = {
  activeTab: SettingsTab;
  onNavigateRoot: () => void;
};

export function SettingsBreadcrumbs({
  activeTab,
  onNavigateRoot,
}: SettingsBreadcrumbsProps) {
  const copy = SETTINGS_COPY;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted"
    >
      <button
        type="button"
        onClick={onNavigateRoot}
        className="transition-colors hover:text-charcoal"
      >
        {copy.breadcrumbRoot}
      </button>
      <ChevronRight className="size-3.5" aria-hidden />
      <span className="font-medium text-charcoal">{copy.tabs[activeTab]}</span>
    </nav>
  );
}
