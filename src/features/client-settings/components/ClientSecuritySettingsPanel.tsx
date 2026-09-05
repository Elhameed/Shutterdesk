import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { CLIENT_SETTINGS_COPY } from "@/constants/client-settings";
import type { ClientSecuritySettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

type ClientSecuritySettingsPanelProps = {
  values: ClientSecuritySettings;
  onChange: <K extends keyof ClientSecuritySettings>(
    key: K,
    value: ClientSecuritySettings[K],
  ) => void;
  onLogoutComplete?: () => void;
  onDeactivate?: () => void;
  isDeactivating?: boolean;
};

export function ClientSecuritySettingsPanel({
  values,
  onChange,
  onLogoutComplete,
  onDeactivate,
  isDeactivating = false,
}: ClientSecuritySettingsPanelProps) {
  const copy = CLIENT_SETTINGS_COPY.security;
  const sessionCopy = CLIENT_SETTINGS_COPY.session;
  const accountCopy = CLIENT_SETTINGS_COPY.account;

  const passwordsMismatch =
    values.newPassword.length > 0 &&
    values.confirmPassword.length > 0 &&
    values.newPassword !== values.confirmPassword;
  const passwordTooShort =
    values.newPassword.length > 0 && values.newPassword.length < 8;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink">{copy.title}</h3>
        <p className="mt-1 text-xs text-ink-soft">{copy.subtitle}</p>
      </div>

      <div className="space-y-4 rounded-md border border-border p-4">
        <h4 className="text-sm font-semibold text-ink">{copy.changePassword}</h4>
        <div className="space-y-2">
          <Label htmlFor="current-password">{copy.currentPassword}</Label>
          <Input
            id="current-password"
            type="password"
            value={values.currentPassword}
            onChange={(event) => onChange("currentPassword", event.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">{copy.newPassword}</Label>
          <Input
            id="new-password"
            type="password"
            value={values.newPassword}
            onChange={(event) => onChange("newPassword", event.target.value)}
            autoComplete="new-password"
            aria-invalid={passwordTooShort}
            className={cn(passwordTooShort && "border-bad/40")}
          />
          {passwordTooShort ? (
            <p className="text-xs text-bad-fg">{copy.passwordTooShort}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{copy.confirmPassword}</Label>
          <Input
            id="confirm-password"
            type="password"
            value={values.confirmPassword}
            onChange={(event) => onChange("confirmPassword", event.target.value)}
            autoComplete="new-password"
            aria-invalid={passwordsMismatch}
            className={cn(passwordsMismatch && "border-bad/40")}
          />
          {passwordsMismatch ? (
            <p className="text-xs text-bad-fg">{copy.passwordMismatch}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-border p-4">
        <p className="text-sm font-semibold text-ink">{sessionCopy.title}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{sessionCopy.description}</p>
        <LogoutButton onComplete={onLogoutComplete} className="mt-3" />
      </div>

      <div className="rounded-md border border-border p-4">
        <p className="text-sm font-semibold text-ink">{accountCopy.title}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{accountCopy.description}</p>
        <button
          type="button"
          disabled={isDeactivating}
          onClick={onDeactivate}
          className="mt-3 text-sm font-semibold text-bad-fg hover:text-bad-fg disabled:opacity-60"
        >
          {isDeactivating ? "Deactivating…" : accountCopy.deactivate}
        </button>
      </div>
    </div>
  );
}
