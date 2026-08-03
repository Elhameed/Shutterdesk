import { SlidersHorizontal } from "lucide-react";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { PAYMENTS_COPY } from "@/constants/photographer-payments";
import { VERIFICATION_STATUS_BADGE_STYLES } from "@/constants/status-colors";
import type { PaymentVerification } from "@/types/domains/payment";
import { cn } from "@/lib/utils";

type VerificationQueueProps = {
  verifications: PaymentVerification[];
  selectedId: string | null;
  from: number;
  to: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onSelect: (verification: PaymentVerification) => void;
  onPageChange: (page: number) => void;
};

function StatusBadge({ status }: { status: PaymentVerification["status"] }) {
  const copy = PAYMENTS_COPY.status;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        VERIFICATION_STATUS_BADGE_STYLES[status],
      )}
    >
      {copy[status]}
    </span>
  );
}

function ClientCell({ verification }: { verification: PaymentVerification }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={verification.avatar}
        alt={verification.clientName}
        className="size-10 shrink-0 rounded-full object-cover"
      />
      <p className="text-sm font-semibold text-charcoal">
        {verification.clientName}
      </p>
    </div>
  );
}

export function VerificationQueue({
  verifications,
  selectedId,
  from,
  to,
  total,
  currentPage,
  totalPages,
  onSelect,
  onPageChange,
}: VerificationQueueProps) {
  const copy = PAYMENTS_COPY;

  if (verifications.length === 0) {
    return (
      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <QueueHeader />
        <div className="p-8 text-center text-sm text-muted">{copy.noResults}</div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <QueueHeader />

      <ul className="divide-y divide-border md:hidden">
        {verifications.map((verification) => (
          <li key={verification.id}>
            <button
              type="button"
              onClick={() => onSelect(verification)}
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-gray-50",
                selectedId === verification.id && "bg-gray-50",
              )}
            >
              <ClientCell verification={verification} />

              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {verification.bookingTitle}
                  </p>
                  <p className="text-xs text-muted">{verification.bookingDate}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-charcoal">
                    {copy.amountDisplay(verification.amount)}
                  </p>
                  <StatusBadge status={verification.status} />
                </div>
                <img
                  src={verification.receiptImage}
                  alt="Payment receipt"
                  className="h-14 w-20 rounded-md border border-border object-cover"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[24%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[22%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-gray-50">
              {Object.values(copy.columns).map((label) => (
                <th
                  key={label}
                  className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {verifications.map((verification) => (
              <tr
                key={verification.id}
                onClick={() => onSelect(verification)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-gray-50",
                  selectedId === verification.id && "bg-gray-50",
                )}
              >
                <td className="px-5 py-4 align-middle">
                  <ClientCell verification={verification} />
                </td>
                <td className="px-5 py-4 align-middle">
                  <p className="text-sm font-semibold text-charcoal">
                    {verification.bookingTitle}
                  </p>
                  <p className="text-xs text-muted">{verification.bookingDate}</p>
                </td>
                <td className="px-5 py-4 align-middle">
                  <p className="text-sm font-bold text-charcoal">
                    {copy.amountDisplay(verification.amount)}
                  </p>
                </td>
                <td className="px-5 py-4 align-middle">
                  <img
                    src={verification.receiptImage}
                    alt="Payment receipt"
                    className="h-14 w-20 rounded-md border border-border object-cover"
                  />
                </td>
                <td className="px-5 py-4 align-middle">
                  <StatusBadge status={verification.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        variant="footer"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        summary={copy.showing(from, to, total)}
      />
    </section>
  );
}

function QueueHeader() {
  const copy = PAYMENTS_COPY;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
      <h2 className="text-sm font-bold text-charcoal">{copy.queueTitle}</h2>
      <Button variant="outline" size="sm" className="gap-2">
        <SlidersHorizontal className="size-4" />
        <span className="hidden sm:inline">{copy.filter}</span>
      </Button>
    </div>
  );
}
