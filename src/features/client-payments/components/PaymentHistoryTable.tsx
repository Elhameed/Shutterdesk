import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { CLIENT_PAYMENTS_COPY, CLIENT_PAYMENTS_PAGE_SIZE } from "@/constants/client-payments";
import type { ClientPaymentRecord } from "@/types/domains/payment";
import { exportPaymentHistoryCsv } from "@/lib/client-downloads";
import { cn } from "@/lib/utils";

type PaymentHistoryTableProps = {
  payments: ClientPaymentRecord[];
};

function studioLabel(payments: ClientPaymentRecord[], studioId: string) {
  return (
    payments.find((item) => item.studioId === studioId)?.studioName ?? "Studio"
  );
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const copy = CLIENT_PAYMENTS_COPY;
  const [page, setPage] = useState(1);
  const [studioFilter, setStudioFilter] = useState<string>("all");

  const studioOptions = useMemo(() => {
    const ids = [...new Set(payments.map((item) => item.studioId))];
    return ids.map((id) => ({ id, name: studioLabel(payments, id) }));
  }, [payments]);

  const filtered = useMemo(() => {
    if (studioFilter === "all") return payments;
    return payments.filter((item) => item.studioId === studioFilter);
  }, [payments, studioFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / CLIENT_PAYMENTS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * CLIENT_PAYMENTS_PAGE_SIZE;
    return filtered.slice(start, start + CLIENT_PAYMENTS_PAGE_SIZE);
  }, [filtered, safePage]);

  const from =
    filtered.length === 0 ? 0 : (safePage - 1) * CLIENT_PAYMENTS_PAGE_SIZE + 1;
  const to = Math.min(safePage * CLIENT_PAYMENTS_PAGE_SIZE, filtered.length);

  return (
    <section className="overflow-hidden rounded-md border border-border bg-panel">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-ink">{copy.paymentHistory}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={studioFilter}
            onChange={(event) => {
              setStudioFilter(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-sm border border-border bg-paper-dim px-3 text-xs font-medium text-ink"
            aria-label="Filter by studio"
          >
            <option value="all">{copy.filterAllStudios}</option>
            {studioOptions.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              exportPaymentHistoryCsv(
                filtered.map((item) => ({
                  bookingTitle: item.bookingTitle,
                  studioName: item.studioName,
                  amount: item.amount,
                  date: item.date,
                  status: item.status,
                })),
              )
            }
            disabled={filtered.length === 0}
            className="flex size-8 items-center justify-center rounded-sm border border-border text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink disabled:opacity-50"
            aria-label="Download payment history"
          >
            <Download className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-ink-soft">{copy.noPayments}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-paper-dim text-[11px] font-medium text-ink-faint">
                <tr>
                  <th className="px-5 py-3">{copy.columns.studio}</th>
                  <th className="px-5 py-3">{copy.columns.booking}</th>
                  <th className="px-5 py-3">{copy.columns.amount}</th>
                  <th className="px-5 py-3">{copy.columns.date}</th>
                  <th className="px-5 py-3">{copy.columns.status}</th>
                  <th className="px-5 py-3">{copy.columns.action}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-ink">
                          {payment.studioName}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-ink">
                        {payment.bookingTitle}
                      </td>
                      <td className="px-5 py-4 text-ink">
                        {copy.amountDisplay(payment.amount)}
                      </td>
                      <td className="px-5 py-4 text-ink-soft">{payment.date}</td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                            payment.status === "approved" &&
                              "bg-ok-tint text-ok-fg",
                            payment.status === "pending" &&
                              "bg-ok-tint text-ok-fg",
                            payment.status === "rejected" &&
                              "bg-bad-tint text-bad-fg",
                          )}
                        >
                          {copy.status[payment.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={payment.receiptImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                        >
                          {copy.viewReceipt}
                        </a>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            variant="footer"
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            summary={copy.showingPayments(from, to, filtered.length)}
          />
        </>
      )}
    </section>
  );
}
