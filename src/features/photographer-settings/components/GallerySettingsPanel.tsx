import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  GALLERY_WATERMARK_KEYS,
  type GalleryWatermarkKey,
  SETTINGS_COPY,
} from "@/constants/photographer-settings";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import { SettingsToggle } from "@/features/photographer-settings/components/SettingsToggle";
import type { GallerySettings } from "@/types/domains/settings";

type GallerySettingsPanelProps = {
  values: GallerySettings;
  onChange: <K extends keyof GallerySettings>(
    key: K,
    value: GallerySettings[K],
  ) => void;
};

function GalleryToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-charcoal">{title}</p>
        <SettingsToggle
          checked={checked}
          onChange={onChange}
          label={title}
          variant="charcoal"
        />
      </div>
      <p className="text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export function GallerySettingsPanel({
  values,
  onChange,
}: GallerySettingsPanelProps) {
  const copy = SETTINGS_COPY.gallery;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="overflow-hidden rounded-xl border border-border lg:grid lg:grid-cols-2">
        <div className="p-5 sm:p-6">
          <GalleryToggleCard
            title={copy.allowDownloads.title}
            description={copy.allowDownloads.description}
            checked={values.allowDownloads}
            onChange={(checked) => onChange("allowDownloads", checked)}
          />
        </div>
        <div className="border-t border-border p-5 sm:p-6 lg:border-t-0 lg:border-l">
          <GalleryToggleCard
            title={copy.passwordProtection.title}
            description={copy.passwordProtection.description}
            checked={values.passwordProtection}
            onChange={(checked) => onChange("passwordProtection", checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] tracking-wider text-muted-light uppercase">
          {copy.watermarkPersistence}
        </Label>
        <div className="space-y-3">
          {GALLERY_WATERMARK_KEYS.map((key: GalleryWatermarkKey) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3"
            >
              <Checkbox
                checked={values[key]}
                onChange={(event) => onChange(key, event.target.checked)}
                className="size-[18px] rounded-sm accent-charcoal"
              />
              <span className="text-sm text-charcoal">
                {copy.watermarkOptions[key]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
