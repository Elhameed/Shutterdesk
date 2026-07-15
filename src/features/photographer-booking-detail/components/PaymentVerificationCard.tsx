import { Link } from "react-router-dom";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { ROUTES } from "@/constants/routes";
import type { BookingDetail } from "@/types/domains/booking";

type PaymentVerificationCardProps = {
  booking: BookingDetail;
};

export function PaymentVerificationCard({ booking }: PaymentVerificationCardProps) {
  const copy = BOOKING_DETAIL_COPY;
  const { payment } = booking;
  const paymentsHref = ROUTES.photographer.paymentVerification({
    verificationId: booking.pendingVerificationId ?? undefined,
    bookingId: booking.id,
  });

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal">
          {copy.paymentVerification}
        </h2>
        <Link
          to={paymentsHref}
          className="text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
        >
          {copy.reviewInPayments}
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-gold" aria-hidden />
        <p className="text-sm font-semibold text-charcoal">
          {payment.statusLabel}
        </p>
      </div>

      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-charcoal p-6 sm:min-h-[260px]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
          aria-hidden
        />
        <img
          src={payment.receiptImage}
          alt="Payment receipt preview"
          className="relative z-10 max-h-[220px] w-auto max-w-full object-contain sm:max-h-[240px]"
        />
      </div>
    </section>
  );
}
