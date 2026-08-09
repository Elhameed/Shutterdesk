import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import {
  GalleryTabSection,
  ToggleSwitch,
} from "@/features/photographer-gallery-detail/components/GalleryTabShared";
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import type {
  GalleryDetail,
  GallerySettingsData,
  GalleryVisibility,
  PhotographerGallery,
} from "@/types/domains/gallery";

type GallerySettingsTabProps = {
  gallery: PhotographerGallery;
  settings: GallerySettingsData;
  onUpdated?: (detail: GalleryDetail) => void;
};

export function GallerySettingsTab({
  gallery,
  settings: initialSettings,
  onUpdated,
}: GallerySettingsTabProps) {
  const panel = GALLERIES_COPY.detail.tabPanels.settings;
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings({
      ...initialSettings,
      accessPin: initialSettings.accessPin ?? "",
    });
  }, [initialSettings]);

  const updateSettings = <K extends keyof GallerySettingsData>(
    key: K,
    value: GallerySettingsData[K],
  ) => {
    setSaved(false);
    setSaveError(null);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await photographerApi.galleries.update(gallery.id, {
        visibility: settings.visibility,
        socialSharing: settings.allowSharing,
        allowFavorites: settings.allowFavorites,
        allowDownloads: settings.allowDownloads,
        showPhotographerCredit: settings.showPhotographerCredit,
        emailNotifications: settings.emailNotifications,
        expirationDate: settings.expirationDate,
        slug: settings.slug,
        accessPin: settings.accessPin,
      });
      const detail = await photographerApi.galleries.getDetail(gallery.id);
      if (detail) {
        onUpdated?.(detail);
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Unable to save gallery settings."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <GalleryTabSection title={panel.visibilityTitle}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{panel.visibility}</Label>
              <Select
                value={settings.visibility}
                onChange={(event) =>
                  updateSettings(
                    "visibility",
                    event.target.value as GalleryVisibility,
                  )
                }
              >
                {Object.entries(panel.visibilityOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{panel.galleryStatus}</Label>
              <Select value={gallery.status} onChange={() => undefined} disabled>
                {Object.entries(panel.statusOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{panel.expirationDate}</Label>
              <Input
                type="date"
                value={settings.expirationDate}
                onChange={(event) =>
                  updateSettings("expirationDate", event.target.value)
                }
              />
            </div>

            {settings.visibility === "password" ? (
              <div className="space-y-2 border-t border-border pt-4">
                <Label>{panel.accessPin}</Label>
                <Input
                  value={settings.accessPin ?? ""}
                  onChange={(event) =>
                    updateSettings("accessPin", event.target.value)
                  }
                  placeholder={panel.accessPinPlaceholder}
                  inputMode="numeric"
                />
                <p className="text-xs text-muted">{panel.accessPinHint}</p>
              </div>
            ) : null}
          </div>
        </GalleryTabSection>

        <GalleryTabSection title={panel.preferencesTitle}>
          <div className="space-y-5">
            <ToggleSwitch
              checked={settings.allowDownloads}
              onChange={(value) => updateSettings("allowDownloads", value)}
              label={GALLERIES_COPY.detail.tabPanels.delivery.downloadEnabled}
              description={GALLERIES_COPY.detail.tabPanels.delivery.downloadEnabledHint}
            />
            <ToggleSwitch
              checked={settings.allowSharing}
              onChange={(value) => updateSettings("allowSharing", value)}
              label={panel.allowSharing}
              description={panel.allowSharingHint}
            />
            <ToggleSwitch
              checked={settings.allowFavorites}
              onChange={(value) => updateSettings("allowFavorites", value)}
              label={panel.allowFavorites}
              description={panel.allowFavoritesHint}
            />
            <ToggleSwitch
              checked={settings.showPhotographerCredit}
              onChange={(value) =>
                updateSettings("showPhotographerCredit", value)
              }
              label={panel.showPhotographerCredit}
              description={panel.showPhotographerCreditHint}
            />
            <ToggleSwitch
              checked={settings.emailNotifications}
              onChange={(value) => updateSettings("emailNotifications", value)}
              label={panel.emailNotifications}
              description={panel.emailNotificationsHint}
            />
          </div>
        </GalleryTabSection>
      </div>

      <GalleryTabSection title={panel.urlTitle}>
        <div className="space-y-2">
          <Label>{panel.customSlug}</Label>
          <div className="flex overflow-hidden rounded-lg border border-border bg-gray-50">
            <span className="flex items-center border-r border-border px-3 text-sm text-muted">
              shutterdesk.rw/g/
            </span>
            <Input
              value={settings.slug}
              onChange={(event) => updateSettings("slug", event.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>
      </GalleryTabSection>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {saveError ? (
            <span className="text-red-700" role="alert">
              {saveError}
            </span>
          ) : saved ? (
            panel.saved
          ) : (
            "\u00A0"
          )}
        </p>
        <Button
          variant="default"
          size="sm"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {panel.saveChanges}
        </Button>
      </div>
    </div>
  );
}
