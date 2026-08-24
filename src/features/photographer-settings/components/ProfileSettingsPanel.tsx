import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Link2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SETTINGS_COPY } from "@/constants/photographer-settings";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl } from "@/lib/media-url";
import type { ProfileSettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

type ProfileSettingsPanelProps = {
  values: ProfileSettings;
  onChange: <K extends keyof ProfileSettings>(
    key: K,
    value: ProfileSettings[K],
  ) => void;
};

export function ProfileSettingsPanel({
  values,
  onChange,
}: ProfileSettingsPanelProps) {
  const copy = SETTINGS_COPY.profile;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploadingAvatar(true);
    setUploadError(null);
    try {
      const secureUrl = await uploadAvatarToCloudinary(file, "photographer");
      onChange("avatar", secureUrl);
    } catch (error) {
      setUploadError(getApiErrorMessage(error, "Unable to upload profile photo."));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const avatarSrc = resolveMediaUrl(values.avatar);

  return (
    <div>
      <div className="space-y-8 p-5 sm:p-6 lg:p-8">
        <div>
          <h2 className="text-lg font-bold text-charcoal">{copy.title}</h2>
          <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(140px,180px)_minmax(0,1fr)] lg:gap-10">
        <div>
          <Label className="text-[10px] tracking-wider text-muted-light uppercase">
            {copy.avatar}
          </Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="group relative mt-3 block w-full overflow-hidden rounded-xl border border-border disabled:opacity-60"
            aria-label="Upload profile photo"
          >
            <img
              src={avatarSrc}
              alt={values.fullName}
              className="aspect-square w-full object-cover"
            />
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "bg-charcoal/0 transition-colors group-hover:bg-charcoal/35",
                "group-focus-visible:bg-charcoal/35",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border-2 border-white bg-white/10",
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  "group-focus-visible:opacity-100",
                  isUploadingAvatar && "opacity-100",
                )}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="size-5 animate-spin text-white" aria-hidden />
                ) : (
                  <Camera className="size-5 text-white" strokeWidth={2} />
                )}
              </span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={isUploadingAvatar}
              onChange={handleAvatarUpload}
            />
          </button>
          {uploadError ? (
            <p className="mt-2 text-xs text-red-600">{uploadError}</p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{copy.fullName}</Label>
              <Input
                value={values.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{copy.displayName}</Label>
              <Input
                value={values.displayName}
                onChange={(event) =>
                  onChange("displayName", event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{copy.professionalBio}</Label>
            <Textarea
              value={values.bio}
              onChange={(event) => onChange("bio", event.target.value)}
              className="min-h-28 resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label>{copy.contactEmail}</Label>
            <Input
              type="email"
              value={values.email}
              onChange={(event) => onChange("email", event.target.value)}
            />
          </div>
        </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="space-y-4 p-5 sm:p-6 lg:p-8">
          <Label className="text-[10px] tracking-wider text-muted-light uppercase">
            {copy.socialLinks}
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <SocialInput
              value={values.instagram}
              placeholder={copy.instagramPlaceholder}
              onChange={(value) => onChange("instagram", value)}
            />
            <SocialInput
              value={values.website}
              placeholder={copy.websitePlaceholder}
              onChange={(value) => onChange("website", value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Link2
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
}
