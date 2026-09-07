import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { INVOICE_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import type { ClientInvoice } from "@/types/domains/photographer-client";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ClientInvoicesTabProps = {
  invoices: ClientInvoice[];
};

export function ClientInvoicesTab({ invoices }: ClientInvoicesTabProps) {
  const copy = CLIENT_PROFILE_COPY;

  if (invoices.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-soft">No invoices yet.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">
                  {invoice.number}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">{invoice.description}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  INVOICE_STATUS_BADGE_STYLES[invoice.status],
                )}
              >
                {copy.invoiceStatus[invoice.status]}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-soft">{invoice.date}</span>
              <span className="font-bold text-ink">
                {formatRwf(invoice.amount)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.invoiceColumns.number}
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.invoiceColumns.description}
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.invoiceColumns.date}
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.invoiceColumns.amount}
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.invoiceColumns.status}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-panel">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-5 py-4 text-sm font-medium text-ink">
                  {invoice.number}
                </td>
                <td className="px-5 py-4 text-sm text-ink">
                  {invoice.description}
                </td>
                <td className="px-5 py-4 text-sm text-ink">
                  {invoice.date}
                </td>
                <td className="px-5 py-4 text-sm font-bold text-ink">
                  {formatRwf(invoice.amount)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                      INVOICE_STATUS_BADGE_STYLES[invoice.status],
                    )}
                  >
                    {copy.invoiceStatus[invoice.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
