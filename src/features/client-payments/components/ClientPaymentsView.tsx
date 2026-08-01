import { useEffect, useState } from "react";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { formatRwf } from "@/lib/currency";
import { PaymentActionRequiredSection } from "@/features/client-payments/components/PaymentActionRequiredSection";
import { PaymentHistoryTable } from "@/features/client-payments/components/PaymentHistoryTable";
import { PaymentsPromoCards } from "@/features/client-payments/components/PaymentsPromoCards";
import { clientApi } from "@/services/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import {
  PageHeaderSkeleton,
  PaymentCardSkeleton,
  TableRowsSkeleton,
} from "@/components/skeletons";
import type { PaymentRequest } from "@/types/domains/booking";
import type { ClientPaymentRecord } from "@/types/domains/payment";

export function ClientPaymentsView() {
  const copy = CLIENT_PAYMENTS_COPY;
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [payments, setPayments] = useState<ClientPaymentRecord[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    void Promise.all([
      clientApi.payments.listRequests(),
      clientApi.payments.getOutstandingSummary(),
      clientApi.payments.list(),
    ]).then(([requestList, summary, history]) => {
      setRequests(requestList);
      setTotalBalance(summary.totalBalance);
      setPayments(history);
      setIsLoading(false);
    });
  }, []);

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

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader title={copy.title} subtitle={copy.subtitle} />

      {totalBalance > 0 && (
        <section className="mt-6 rounded-xl border border-border bg-gray-50 p-5">
          <p className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.totalDue}
          </p>
          <p className="mt-2 text-2xl font-bold text-charcoal">
            {formatRwf(totalBalance)}
          </p>
          {unpaid.length > 1 ? (
            <p className="mt-1 text-sm text-muted">
              {copy.obligationsAcrossStudios(unpaid.length)}
            </p>
          ) : unpaid.length === 1 ? (
            <p className="mt-1 text-sm text-muted">
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
