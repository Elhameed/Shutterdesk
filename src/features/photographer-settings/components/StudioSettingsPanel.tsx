import { useState } from "react";
import { PHOTOGRAPHER_SPECIALIZATIONS } from "@/constants/onboarding";
import { BadgeCheck, FileUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  BRAND_COLOR_PRESETS,
  SETTINGS_COPY,
} from "@/constants/photographer-settings";
import { FileUploadDropzone } from "@/features/photographer-settings/components/FileUploadDropzone";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import { uploadBrandingToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl } from "@/lib/media-url";
import type { StudioSettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

type StudioSettingsPanelProps = {
  values: StudioSettings;
  onChange: <K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K],
  ) => void;
};

export function StudioSettingsPanel({
  values,
  onChange,
}: StudioSettingsPanelProps) {
  const copy = SETTINGS_COPY.studio;
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleColorInput = (value: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      onChange("brandAccentColor", value);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setUploadError(null);
    try {
      const url = await uploadBrandingToCloudinary(file);
      onChange("logoAssetKey", url);
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "Unable to upload logo."));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleWatermarkUpload = async (file: File) => {
    setUploadingWatermark(true);
    setUploadError(null);
    try {
      const url = await uploadBrandingToCloudinary(file);
      onChange("watermarkAssetKey", url);
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "Unable to upload watermark."));
    } finally {
      setUploadingWatermark(false);
    }
  };

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>{copy.studioName}</Label>
          <Input
            value={values.studioName}
            onChange={(event) => onChange("studioName", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{copy.specialization}</Label>
          <Select
            value={values.specialization}
            onChange={(event) => onChange("specialization", event.target.value)}
          >
            <option value="">{copy.specializationPlaceholder}</option>
            {PHOTOGRAPHER_SPECIALIZATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label>{copy.brandAccentColor}</Label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {BRAND_COLOR_PRESETS.map((color) => {
                const isSelected = values.brandAccentColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select brand color ${color}`}
                    onClick={() => onChange("brandAccentColor", color)}
                    className={cn(
                      "size-10 rounded-lg transition-shadow",
                      isSelected && "ring-2 ring-gold ring-offset-2",
                    )}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
            <Input
              value={values.brandAccentColor}
              onChange={(event) => handleColorInput(event.target.value)}
              className="w-28 font-mono text-sm uppercase"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>{copy.primaryLogo}</Label>
          {values.logoAssetKey ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-border bg-gray-50 p-4">
              <img
                src={resolveMediaUrl(values.logoAssetKey)}
                alt="Studio logo"
                className="mx-auto max-h-24 object-contain"
              />
            </div>
          ) : null}
          <FileUploadDropzone
            icon={
              uploadingLogo ? (
                <Loader2 className="mx-auto size-8 animate-spin" />
              ) : (
                <FileUp className="mx-auto size-8" strokeWidth={1.5} />
              )
            }
            title={
              <>
                Drag logo here or{" "}
                <span className="font-semibold">browse</span>
              </>
            }
            hint={copy.logoDropHint}
            accept="image/png,image/svg+xml,image/jpeg"
            onFileSelect={(file) => void handleLogoUpload(file)}
          />
        </div>

        <div className="space-y-2">
          <Label>{copy.galleryWatermark}</Label>
          {values.watermarkAssetKey ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-border bg-gray-50 p-4">
              <img
                src={resolveMediaUrl(values.watermarkAssetKey)}
                alt="Gallery watermark"
                className="mx-auto max-h-24 object-contain"
              />
            </div>
          ) : null}
          <FileUploadDropzone
            icon={
              uploadingWatermark ? (
                <Loader2 className="mx-auto size-8 animate-spin" />
              ) : (
                <BadgeCheck className="mx-auto size-8" strokeWidth={1.5} />
              )
            }
            title={copy.watermarkDropTitle}
            hint={copy.watermarkDropHint}
            accept="image/png"
            onFileSelect={(file) => void handleWatermarkUpload(file)}
          />
        </div>
      </div>

      {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
    </div>
  );
}
