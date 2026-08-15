import { Link } from "react-router-dom";
import { CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import { ROUTES } from "@/constants/routes";
import { resolveClientPaymentBalanceDisplay } from "@/features/client-booking-detail/lib/payment-balance-display";
import { formatRwf } from "@/lib/currency";
import type { BookingDetail } from "@/types/domains/booking";

type ClientPaymentStatusCardProps = {
  payment: BookingDetail["payment"];
  bookingId: string;
  /** A receipt is already awaiting studio verification — hide pay actions. */
  paymentPending: boolean;
};

export function ClientPaymentStatusCard({
  payment,
  bookingId,
  paymentPending,
}: ClientPaymentStatusCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;
  const balance = resolveClientPaymentBalanceDisplay(payment, {
    depositDue: copy.depositDue,
    outstandingBalance: copy.outstandingBalance,
    paidInFull: copy.paidInFull,
    noOutstandingBalance: copy.noOutstandingBalance,
  });

  const canPay =
    !balance.isPaidInFull && payment.outstandingDue > 0 && !paymentPending;
  // Only worth offering "pay in full" separately before any deposit is paid —
  // once a deposit is in, the remaining balance already equals the full amount.
  const showPayInFull = canPay && payment.amountPaid === 0;
  const uploadHref = ROUTES.client.uploadReceiptForBooking(bookingId);

  return (
    <section className="rounded-xl bg-charcoal p-5 text-white shadow-card sm:p-6">
      <h2 className="text-base font-bold">{copy.paymentStatus}</h2>

      <p className="mt-4 text-sm font-semibold text-gold">
        {payment.statusLabel}
      </p>

      <div className="mt-4">
        <p className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">
          {copy.amountPaid}
        </p>
        <p className="mt-1 text-xl font-bold">
          {formatRwf(payment.amountPaid)}
        </p>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-[10px] font-semibold tracking-wider text-white/60 uppercase">
          {balance.label}
        </p>
        {balance.isPaidInFull ? (
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-gold">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            {balance.paidInFullLabel}
          </p>
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {formatRwf(balance.amount)}
          </p>
        )}
      </div>

      {canPay ? (
        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5">
          <Button variant="gold" className="w-full shadow-card" asChild>
            <Link to={uploadHref}>
              <Wallet className="size-4" aria-hidden />
              {copy.payNow}
            </Link>
          </Button>
          {showPayInFull ? (
            <Link
              to={`${uploadHref}&option=full`}
              className="text-center text-xs font-semibold text-white/70 transition-colors hover:text-gold"
            >
              {copy.payInFull(formatRwf(payment.outstandingDue))}
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mt-5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
        {copy.securedBy}
      </p>
    </section>
  );
}
