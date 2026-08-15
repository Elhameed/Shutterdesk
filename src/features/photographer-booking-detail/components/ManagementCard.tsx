import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { ROUTES } from "@/constants/routes";
import type { BookingDetail } from "@/types/domains/booking";

type ManagementCardProps = {
  booking: BookingDetail;
};

export function ManagementCard({ booking }: ManagementCardProps) {
  const copy = BOOKING_DETAIL_COPY;
  const paymentsHref = ROUTES.photographer.paymentVerification({
    verificationId: booking.pendingVerificationId ?? undefined,
    bookingId: booking.id,
  });

  return (
    <section className="rounded-xl bg-charcoal p-5 text-white shadow-card">
      <h2 className="text-sm font-bold">{copy.management}</h2>

      <p className="mt-3 text-sm leading-relaxed text-white/75">
        {copy.paymentVerificationNote}
      </p>

      <div className="mt-4">
        <Button variant="gold" className="h-12 w-full text-xs font-bold tracking-wide uppercase" asChild>
          <Link to={paymentsHref}>
            <Check className="size-4" strokeWidth={3} />
            {copy.openPaymentsQueue}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <p className="mt-4 text-center text-[9px] font-semibold tracking-widest text-white/50 uppercase">
        {copy.managementFooter}
      </p>
    </section>
  );
}
