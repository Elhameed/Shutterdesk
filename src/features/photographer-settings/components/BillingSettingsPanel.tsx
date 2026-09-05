import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SETTINGS_COPY } from "@/constants/photographer-settings";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { BillingInvoice } from "@/types/domains/settings";

type BillingSettingsPanelProps = {
  invoices: BillingInvoice[];
};

export function BillingSettingsPanel({ invoices }: BillingSettingsPanelProps) {
  const copy = SETTINGS_COPY.billing;
  const comingSoon = SETTINGS_COPY.comingSoon;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />
        <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-medium text-ink">
          {copy.proPlan}
        </span>
      </div>

      <div className="flex flex-col gap-5 rounded-md bg-ink p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="max-w-xl">
          <p className="text-base font-semibold text-white sm:text-lg">
            {copy.upgrade.title}
          </p>
          <p className="mt-2 text-sm text-white/70">{copy.upgrade.description}</p>
        </div>
        <Button
          variant="gold"
          size="sm"
          className="shrink-0 self-start sm:self-auto"
          disabled
          title={comingSoon}
        >
          {copy.upgrade.action} — {comingSoon}
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] text-ink-faint">
          {copy.billingHistory}
        </Label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                  {copy.columns.date}
                </th>
                <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                  {copy.columns.invoice}
                </th>
                <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                  {copy.columns.amount}
                </th>
                <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                  {copy.columns.status}
                </th>
                <th className="pb-3 text-right text-[10px] font-medium text-ink-faint">
                  {copy.columns.action}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-4 text-sm text-ink">{invoice.date}</td>
                  <td className="py-4 text-sm text-ink-soft">{invoice.invoice}</td>
                  <td className="py-4 text-sm font-semibold text-ink">
                    {formatRwf(invoice.amount)}
                  </td>
                  <td className="py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                        "bg-ok-tint text-ok-fg",
                      )}
                    >
                      {copy.status[invoice.status]}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      disabled
                      title={comingSoon}
                      aria-label={`${copy.downloadInvoice} ${invoice.invoice} (${comingSoon})`}
                      className="inline-flex size-9 cursor-not-allowed items-center justify-center rounded-sm text-ink-faint opacity-50"
                    >
                      <Download className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
