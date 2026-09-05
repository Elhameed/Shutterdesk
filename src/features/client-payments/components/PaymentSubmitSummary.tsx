import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { formatRwf } from "@/lib/currency";

type PaymentSubmitSummaryProps = {
  amount: number;
  isSubmitting: boolean;
};

export function PaymentSubmitSummary({
  amount,
  isSubmitting,
}: PaymentSubmitSummaryProps) {
  const copy = CLIENT_PAYMENTS_COPY.upload;

  return (
    <section className="rounded-md bg-ink p-5 text-white sm:p-6">
      <div className="flex items-center gap-2 text-accent">
        <Wallet className="size-5" aria-hidden />
        <p className="text-[10px] font-medium">
          {copy.totalPayment}
        </p>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">
        {formatRwf(amount)}
      </p>

      <Button
        type="submit"
        variant="gold"
        className="mt-6 h-12 w-full text-base"
        disabled={isSubmitting}
      >
        {copy.submit} →
      </Button>

      <p className="mt-4 text-center text-[10px] text-white/50">
        {copy.securedNote}
      </p>
    </section>
  );
}
