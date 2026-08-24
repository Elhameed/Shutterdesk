import { Building2, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SETTINGS_COPY } from "@/constants/photographer-settings";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import { SettingsToggle } from "@/features/photographer-settings/components/SettingsToggle";
import type { PaymentSettings } from "@/types/domains/settings";
import { cn } from "@/lib/utils";

type PaymentSettingsPanelProps = {
  values: PaymentSettings;
  onChange: <K extends keyof PaymentSettings>(
    key: K,
    value: PaymentSettings[K],
  ) => void;
};

export function PaymentSettingsPanel({
  values,
  onChange,
}: PaymentSettingsPanelProps) {
  const copy = SETTINGS_COPY.payment;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <Building2 className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {copy.bankTransfer.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {copy.bankTransfer.description}
                </p>
              </div>
            </div>
            <SettingsToggle
              checked={values.bankTransferEnabled}
              onChange={(checked) => onChange("bankTransferEnabled", checked)}
              label={copy.bankTransfer.title}
              variant="charcoal"
            />
          </div>

          {values.bankTransferEnabled && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{copy.bankTransfer.accountName}</Label>
                <Input
                  value={values.accountName}
                  onChange={(event) =>
                    onChange("accountName", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.bankTransfer.accountNumber}</Label>
                <Input
                  value={values.accountNumber}
                  onChange={(event) =>
                    onChange("accountNumber", event.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted">
                <QrCode className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {copy.mobileMoney.title}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {copy.mobileMoney.description}
                </p>
              </div>
            </div>
            <SettingsToggle
              checked={values.mobileMoneyEnabled}
              onChange={(checked) => onChange("mobileMoneyEnabled", checked)}
              label={copy.mobileMoney.title}
              variant="charcoal"
            />
          </div>

          {values.mobileMoneyEnabled && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.mobileMoney.provider}</Label>
                <Select
                  value={values.provider}
                  onChange={(event) => onChange("provider", event.target.value)}
                >
                  <option value="MTN Mobile Money (MoMo)">
                    MTN Mobile Money (MoMo)
                  </option>
                  <option value="Airtel Money">Airtel Money</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{copy.mobileMoney.accountName}</Label>
                <Input
                  value={values.momoAccountName}
                  onChange={(event) =>
                    onChange("momoAccountName", event.target.value)
                  }
                  placeholder={copy.mobileMoney.accountNamePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.mobileMoney.phoneNumber}</Label>
                <Input
                  type="tel"
                  value={values.momoNumber}
                  onChange={(event) => onChange("momoNumber", event.target.value)}
                  placeholder={copy.mobileMoney.phoneNumberPlaceholder}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{copy.mobileMoney.merchantCode}</Label>
                <Input
                  value={values.merchantCode}
                  onChange={(event) =>
                    onChange("merchantCode", event.target.value)
                  }
                  placeholder={copy.mobileMoney.merchantCodePlaceholder}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] tracking-wider text-muted-light uppercase">
          {copy.depositRequirements}
        </Label>
        <div className="space-y-3">
          {(
            [
              { value: "half", key: "half" },
              { value: "none", key: "none" },
            ] as const
          ).map(({ value, key }) => {
            const option = copy.depositOptions[key];
            const isSelected = values.depositRequirement === value;

            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  isSelected
                    ? "border-charcoal bg-gray-50/80"
                    : "border-border hover:border-muted",
                )}
              >
                <input
                  type="radio"
                  name="depositRequirement"
                  checked={isSelected}
                  onChange={() => onChange("depositRequirement", value)}
                  className="mt-0.5 size-4 shrink-0 accent-charcoal"
                />
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {option.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
