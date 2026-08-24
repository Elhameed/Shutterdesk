import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { SETTINGS_COPY } from "@/constants/photographer-settings";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import type { SecuritySettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

type SecuritySettingsPanelProps = {
  values: SecuritySettings;
  onChange: <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K],
  ) => void;
  onDeactivate?: () => void;
  isDeactivating?: boolean;
};

export function SecuritySettingsPanel({
  values,
  onChange,
  onDeactivate,
  isDeactivating = false,
}: SecuritySettingsPanelProps) {
  const copy = SETTINGS_COPY.security;

  const passwordsMismatch =
    values.newPassword.length > 0 &&
    values.confirmPassword.length > 0 &&
    values.newPassword !== values.confirmPassword;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="space-y-4 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-charcoal">
            {copy.changePassword}
          </h3>
          <div className="space-y-2">
            <Label>{copy.currentPassword}</Label>
            <Input
              type="password"
              value={values.currentPassword}
              onChange={(event) =>
                onChange("currentPassword", event.target.value)
              }
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label>{copy.newPassword}</Label>
            <Input
              type="password"
              value={values.newPassword}
              onChange={(event) => onChange("newPassword", event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label>{copy.confirmPassword}</Label>
            <Input
              type="password"
              value={values.confirmPassword}
              onChange={(event) =>
                onChange("confirmPassword", event.target.value)
              }
              autoComplete="new-password"
              aria-invalid={passwordsMismatch}
              className={cn(passwordsMismatch && "border-red-300")}
            />
            {passwordsMismatch ? (
              <p className="text-xs text-red-600">New passwords do not match.</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {copy.twoFactor.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {copy.twoFactor.description}
            </p>
          </div>
          <span className="shrink-0 self-start rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-wider text-muted uppercase sm:self-auto">
            {copy.twoFactor.comingSoon}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {copy.account.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{copy.account.description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeactivating}
            className="shrink-0 self-start border-red-200 text-red-700 hover:bg-red-50 sm:self-auto"
            onClick={onDeactivate}
          >
            {isDeactivating ? "Deactivating…" : copy.account.deactivate}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {copy.session.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{copy.session.description}</p>
          </div>
          <LogoutButton className="shrink-0 self-start sm:self-auto" />
        </div>
      </div>
    </div>
  );
}
