import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import { PAYMENTS_COPY } from "@/constants/photographer-payments";
import { PaymentDetailDrawer } from "@/features/photographer-payments/components/PaymentDetailDrawer";
import { PaymentsHeader } from "@/features/photographer-payments/components/PaymentsHeader";
import { PaymentsStats } from "@/features/photographer-payments/components/PaymentsStats";
import { VerificationQueue } from "@/features/photographer-payments/components/VerificationQueue";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { usePhotographerVerifications } from "@/hooks/queries/photographer";
import {
  useRequestReceiptResubmission,
  useUpdateVerificationStatus,
} from "@/hooks/queries/photographer-mutations";
import {
  PageHeaderSkeleton,
  StatCardGridSkeleton,
  TableRowsSkeleton,
} from "@/components/skeletons";
import {
  PAYMENT_VERIFICATION_PAGE_SIZE,
  searchPaymentVerifications,
  type PaymentVerification,
} from "@/types/domains/payment";

export function PaymentsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { push } = useToast();
  const copy = PAYMENTS_COPY;
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: verifications = [], isPending } = usePhotographerVerifications();
  const showSkeleton = useDelayedLoading(isPending);
  const updateStatus = useUpdateVerificationStatus();
  const requestResubmission = useRequestReceiptResubmission();
  const isSubmitting = updateStatus.isPending || requestResubmission.isPending;
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentVerification | null>(null);

  const verificationParam = searchParams.get("verification");
  const bookingParam = searchParams.get("booking");
  const clientQuery = searchParams.get("q");

  useEffect(() => {
    if (clientQuery) {
      setSearchQuery(clientQuery);
      setCurrentPage(1);
    }
  }, [clientQuery]);

  useEffect(() => {
    if (isPending || verifications.length === 0) return;

    const matched =
      (verificationParam
        ? verifications.find((item) => item.id === verificationParam)
        : undefined) ??
      (bookingParam
        ? verifications.find((item) => item.bookingId === bookingParam)
        : undefined);

    if (matched) {
      setSelectedPayment(matched);
    }
  }, [bookingParam, isPending, verificationParam, verifications]);

  const handleCloseDrawer = () => {
    setSelectedPayment(null);
    if (verificationParam || bookingParam) {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredVerifications = useMemo(() => {
    return searchPaymentVerifications(verifications, searchQuery);
  }, [searchQuery, verifications]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVerifications.length / PAYMENT_VERIFICATION_PAGE_SIZE),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedVerifications = useMemo(() => {
    const start = (safePage - 1) * PAYMENT_VERIFICATION_PAGE_SIZE;
    return filteredVerifications.slice(start, start + PAYMENT_VERIFICATION_PAGE_SIZE);
  }, [filteredVerifications, safePage]);

  const from =
    filteredVerifications.length === 0
      ? 0
      : (safePage - 1) * PAYMENT_VERIFICATION_PAGE_SIZE + 1;
  const to = Math.min(
    safePage * PAYMENT_VERIFICATION_PAGE_SIZE,
    filteredVerifications.length,
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Only ever called with "approved" or "rejected" — the wider
  // PaymentVerification["status"] included "pending", which the API rejects.
  const handlePaymentAction = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    const updated = await updateStatus.mutateAsync({ id, status });
    if (updated) {
      setSelectedPayment(updated);
    }
  };

  const handleRequestResubmission = async (id: string) => {
    try {
      const updated = await requestResubmission.mutateAsync(id);
      if (updated) {
        setSelectedPayment(updated);
        push({
          title: copy.detail.requestNewReceiptSuccess,
          variant: "success",
        });
        return;
      }

      push({
        title: copy.detail.requestNewReceiptError,
        variant: "error",
      });
    } catch {
      push({
        title: copy.detail.requestNewReceiptError,
        variant: "error",
      });
    }
  };

  if (showSkeleton) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <PageHeaderSkeleton />
        <div className="mt-6">
          <StatCardGridSkeleton count={3} />
        </div>
        <div className="mt-6">
          <TableRowsSkeleton rows={PAYMENT_VERIFICATION_PAGE_SIZE} />
        </div>
      </div>
    );
  }

  if (isPending) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PaymentsHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <div className="mt-6">
        <PaymentsStats verifications={verifications} />
      </div>

      <div className="mt-6">
        <VerificationQueue
          verifications={paginatedVerifications}
          selectedId={selectedPayment?.id ?? null}
          from={from}
          to={to}
          total={filteredVerifications.length}
          currentPage={safePage}
          totalPages={totalPages}
          onSelect={setSelectedPayment}
          onPageChange={(page) =>
            setCurrentPage(Math.max(1, Math.min(totalPages, page)))
          }
        />
      </div>

      <PaymentDetailDrawer
        payment={selectedPayment}
        onClose={handleCloseDrawer}
        onApprove={(id) => void handlePaymentAction(id, "approved")}
        onReject={(id) => void handlePaymentAction(id, "rejected")}
        onRequestResubmission={(id) => void handleRequestResubmission(id)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
