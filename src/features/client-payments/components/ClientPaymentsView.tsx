import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { formatRwf } from "@/lib/currency";
import { PaymentActionRequiredSection } from "@/features/client-payments/components/PaymentActionRequiredSection";
import { PaymentHistoryTable } from "@/features/client-payments/components/PaymentHistoryTable";
import { PaymentsPromoCards } from "@/features/client-payments/components/PaymentsPromoCards";
import {
  useClientOutstandingSummary,
  useClientPaymentHistory,
  useClientPaymentRequests,
} from "@/hooks/queries/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import {
  PageHeaderSkeleton,
  PaymentCardSkeleton,
  TableRowsSkeleton,
} from "@/components/skeletons";

export function ClientPaymentsView() {
  const copy = CLIENT_PAYMENTS_COPY;
  // Three independent queries rather than one Promise.all, so each caches and
  // invalidates on its own. Query still runs them in parallel.
  const requestsQuery = useClientPaymentRequests();
  const outstandingQuery = useClientOutstandingSummary();
  const historyQuery = useClientPaymentHistory();

  const requests = requestsQuery.data ?? [];
  const payments = historyQuery.data ?? [];
  const totalBalance = outstandingQuery.data?.totalBalance ?? 0;
  const isPending =
    requestsQuery.isPending || outstandingQuery.isPending || historyQuery.isPending;
  const showSkeleton = useDelayedLoading(isPending);

  const unpaid = requests.filter((item) => item.status === "unpaid");

  if (showSkeleton) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <PageHeaderSkeleton withAction={false} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PaymentCardSkeleton />
          <PaymentCardSkeleton />
        </div>
        <div className="mt-6">
          <TableRowsSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (isPending) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader title={copy.title} subtitle={copy.subtitle} />

      {totalBalance > 0 && (
        <section className="mt-6 rounded-md border border-border bg-paper-dim p-5">
          <p className="text-[11px] font-medium text-ink-faint">
            {copy.totalDue}
          </p>
          <p className="mt-2 text-2xl font-bold text-ink">
            {formatRwf(totalBalance)}
          </p>
          {unpaid.length > 1 ? (
            <p className="mt-1 text-sm text-ink-soft">
              {copy.obligationsAcrossStudios(unpaid.length)}
            </p>
          ) : unpaid.length === 1 ? (
            <p className="mt-1 text-sm text-ink-soft">
              {copy.actionRequiredSubtitle(1)}
            </p>
          ) : null}
        </section>
      )}

      <div className="mt-6">
        <PaymentActionRequiredSection requests={requests} />
      </div>

      <div className="mt-6">
        <PaymentHistoryTable payments={payments} />
      </div>

      <div className="mt-6">
        <PaymentsPromoCards />
      </div>
    </div>
  );
}
