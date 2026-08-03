import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { PAYMENTS_COPY } from "@/constants/photographer-payments";
import type { PaymentVerification } from "@/types/domains/payment";

type PaymentDetailDrawerProps = {
  payment: PaymentVerification | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestResubmission: (id: string) => void;
  isSubmitting?: boolean;
};

export function PaymentDetailDrawer({
  payment,
  onClose,
  onApprove,
  onReject,
  onRequestResubmission,
  isSubmitting = false,
}: PaymentDetailDrawerProps) {
  const copy = PAYMENTS_COPY;
  const detail = copy.detail;

  return (
    <Drawer
      open={payment !== null}
      onClose={onClose}
      title={detail.title}
      footer={
        payment?.status === "pending" ? (
          <div className="space-y-3">
            <Button
              variant="default"
              className="w-full"
              onClick={() => onApprove(payment.id)}
              disabled={isSubmitting}
            >
              {detail.approvePayment}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onReject(payment.id)}
              disabled={isSubmitting}
            >
              {detail.rejectPayment}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-charcoal transition-colors hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => onRequestResubmission(payment.id)}
              disabled={isSubmitting}
            >
              {detail.requestNewReceipt}
            </button>
          </div>
        ) : null
      }
    >
      {payment && (
        <div className="space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {detail.receiptEvidence}
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
              >
                {detail.expand}
                <Expand className="size-3.5" aria-hidden />
              </button>
            </div>

            <img
              src={payment.receiptImage}
              alt="Payment receipt evidence"
              className="mx-auto max-h-80 w-full max-w-[220px] rounded-xl border border-border object-cover shadow-sm"
            />
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {detail.transactionId}
              </p>
              <p className="text-sm font-bold text-charcoal">
                {payment.transactionId}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <DetailField label={detail.client} value={payment.clientName} />
              <DetailField
                label={detail.bookingDate}
                value={payment.bookingDate}
              />
              <DetailField label={detail.package} value={payment.packageName} />
              <DetailField
                label={detail.totalFee}
                value={copy.feeDisplay(payment.amount)}
              />
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-charcoal">{value}</p>
    </div>
  );
}
