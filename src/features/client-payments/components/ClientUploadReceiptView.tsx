import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PortalBreadcrumbs } from "@/components/common/PortalBreadcrumbs";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { Button } from "@/components/ui/button";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { ROUTES } from "@/constants/routes";
import { AmountDueBanner } from "@/features/client-payments/components/AmountDueBanner";
import { PaymentContextBanner } from "@/features/client-payments/components/PaymentContextBanner";
import { PaymentMethodPanel } from "@/features/client-payments/components/PaymentMethodPanel";
import {
  PaymentOptionSelector,
  type PaymentOption,
} from "@/features/client-payments/components/PaymentOptionSelector";
import { PaymentSubmitSummary } from "@/features/client-payments/components/PaymentSubmitSummary";
import { ReceiptUploadZone } from "@/features/client-payments/components/ReceiptUploadZone";
import { clientApi } from "@/services/client";
import { uploadReceiptToCloudinary } from "@/lib/cloudinary-upload";
import { getApiErrorMessage } from "@/lib/api-error";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { FormSkeleton } from "@/components/skeletons";
import type { PaymentRequest } from "@/types/domains/booking";

export function ClientUploadReceiptView() {
  const copy = CLIENT_PAYMENTS_COPY.upload;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);

  const bookingParam = searchParams.get("booking") ?? "";
  const paymentParam = searchParams.get("payment") ?? "";
  const optionParam = searchParams.get("option");

  useEffect(() => {
    async function loadRequests() {
      const data = await clientApi.payments.listRequests();
      setRequests(data);
      setIsLoading(false);
    }
    void loadRequests();
  }, []);

  const initialRequest = useMemo(() => {
    if (paymentParam) {
      return requests.find((item) => item.id === paymentParam);
    }
    return (
      requests.find(
        (item) => item.bookingId === bookingParam && item.status === "unpaid",
      ) ?? requests.find((item) => item.status === "unpaid")
    );
  }, [requests, paymentParam, bookingParam]);

  const [paymentRequestId, setPaymentRequestId] = useState("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>(
    optionParam === "full" ? "full" : "deposit",
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRequest && !paymentRequestId) {
      setPaymentRequestId(initialRequest.id);
    }
  }, [initialRequest, paymentRequestId]);

  const activeRequest = useMemo(
    () =>
      requests.find((item) => item.id === paymentRequestId) ?? initialRequest,
    [requests, paymentRequestId, initialRequest],
  );

  const unpaidRequests = requests.filter((item) => item.status === "unpaid");
  const depositAmount = activeRequest?.amount ?? 0;
  const fullAmount = activeRequest?.fullAmount ?? depositAmount;
  const canPayFull = fullAmount > depositAmount;
  const effectiveOption: PaymentOption = canPayFull ? paymentOption : "deposit";
  const amount = effectiveOption === "full" ? fullAmount : depositAmount;
  const isBalanceRequest = activeRequest?.type === "balance";
  const depositOptionLabel = isBalanceRequest ? copy.payBalance : copy.payDeposit;
  const depositOptionHint = isBalanceRequest ? copy.balanceHint : copy.depositHint;
  const studioId = activeRequest?.studioId ?? "imani-uwase-photography";
  const bookingId = activeRequest?.bookingId ?? bookingParam;
  const bookingReference = activeRequest?.bookingReference ?? "";
  const invoiceRef = activeRequest?.invoiceRef ?? "";
  const bookingTitle = activeRequest?.bookingTitle ?? "";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeRequest || !receiptFile) {
      setSubmitError("Please choose a receipt file before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const receiptUrl = await uploadReceiptToCloudinary(receiptFile);
      await clientApi.payments.uploadReceipt({
        bookingId: activeRequest.bookingId,
        paymentRequestId: activeRequest.id,
        amount,
        receiptImage: receiptUrl,
        paymentOption: effectiveOption,
      });
      navigate(ROUTES.client.payments);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Unable to submit receipt."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReceiptSelect(file: File | null, previewUrl: string) {
    setReceiptFile(file);
    setReceiptPreview(previewUrl);
    setSubmitError(null);
  }

  if (showSkeleton) {
    return <FormSkeleton fields={4} />;
  }

  if (isLoading) {
    return null;
  }

  if (!activeRequest) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">No payment obligation found.</p>
        <Button className="mt-4" asChild>
          <Link to={ROUTES.client.payments}>Back to Payments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalBreadcrumbs
        items={[
          { label: CLIENT_PAYMENTS_COPY.title, href: ROUTES.client.payments },
          { label: copy.title },
        ]}
        className="mb-4"
      />

      <PortalPageHeader title={copy.title} subtitle={copy.subtitle} />

      <PaymentContextBanner
        studioName={activeRequest?.studioName ?? "Imani Uwase Photography"}
        bookingTitle={bookingTitle}
        bookingReference={bookingReference}
      />

      {canPayFull ? (
        <PaymentOptionSelector
          value={effectiveOption}
          onChange={setPaymentOption}
          depositAmount={depositAmount}
          fullAmount={fullAmount}
          depositLabel={depositOptionLabel}
          depositHint={depositOptionHint}
        />
      ) : null}

      <AmountDueBanner amount={amount} invoiceRef={invoiceRef} />

      <div className="mt-6">
        <PaymentMethodPanel
          studioId={studioId}
          bookingReference={bookingReference}
        />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {unpaidRequests.length > 1 ? (
          <div className="max-w-md space-y-2">
            <label htmlFor="payment-request" className="text-sm font-medium">
              {CLIENT_PAYMENTS_COPY.upload.bookingLabel}
            </label>
            <select
              id="payment-request"
              value={paymentRequestId}
              onChange={(event) => setPaymentRequestId(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-gray-50 px-3 text-sm"
            >
              {unpaidRequests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.bookingTitle} — {CLIENT_PAYMENTS_COPY.amountDisplay(request.amount)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <ReceiptUploadZone
            file={receiptFile}
            previewUrl={receiptPreview}
            onFileSelect={handleReceiptSelect}
            disabled={isSubmitting}
          />
          <PaymentSubmitSummary amount={amount} isSubmitting={isSubmitting} />
        </div>

        {submitError ? (
          <p className="text-sm text-red-600">{submitError}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.client.payments}>{copy.cancel}</Link>
          </Button>
          {bookingId ? (
            <Button type="button" variant="ghost" asChild>
              <Link to={ROUTES.client.bookingDetail(bookingId)}>
                View booking
              </Link>
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
