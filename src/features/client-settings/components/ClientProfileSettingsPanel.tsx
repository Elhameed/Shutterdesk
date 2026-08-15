import { InterestChips } from "@/components/onboarding/InterestChips";
import { ProfilePhotoUpload } from "@/components/onboarding/ProfilePhotoUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_INTERESTS } from "@/constants/onboarding";
import { CLIENT_SETTINGS_COPY } from "@/constants/client-settings";
import type { ClientSettings } from "@/types/domains/settings";

type ClientProfileSettingsPanelProps = {
  values: ClientSettings;
  onChange: <K extends keyof ClientSettings>(key: K, value: ClientSettings[K]) => void;
  onPhotoSelected: (file: File) => void;
  profilePreview: string | null;
};

export function ClientProfileSettingsPanel({
  values,
  onChange,
  onPhotoSelected,
  profilePreview,
}: ClientProfileSettingsPanelProps) {
  const copy = CLIENT_SETTINGS_COPY.profile;

  return (
    <div className="space-y-6">
      <ProfilePhotoUpload
        preview={profilePreview}
        title={copy.profilePhoto}
        hint={copy.profilePhotoHint}
        onChange={(file) => {
          onPhotoSelected(file);
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="client-full-name">{copy.fullName}</Label>
        <Input
          id="client-full-name"
          value={values.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-email">{copy.email}</Label>
        <Input
          id="client-email"
          type="email"
          value={values.email}
          disabled
          readOnly
        />
        <p className="text-xs text-muted">{CLIENT_SETTINGS_COPY.profile.emailHint}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-phone">{copy.phone}</Label>
        <Input
          id="client-phone"
          type="tel"
          value={values.phone}
          placeholder={copy.phonePlaceholder}
          onChange={(event) => onChange("phone", event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-address">{copy.address}</Label>
        <Input
          id="client-address"
          value={values.address}
          placeholder={copy.addressPlaceholder}
          onChange={(event) => onChange("address", event.target.value)}
          required
        />
      </div>

      <InterestChips
        label={copy.interests}
        options={CLIENT_INTERESTS}
        selected={values.interests}
        onToggle={(interest) => {
          const next = values.interests.includes(interest)
            ? values.interests.filter((item) => item !== interest)
            : [...values.interests, interest];
          onChange("interests", next);
        }}
      />
    </div>
  );
}
