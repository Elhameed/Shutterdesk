import { Link } from "react-router-dom";
import { Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { ROUTES } from "@/constants/routes";
import { formatRwf } from "@/lib/currency";
import type { PaymentRequest } from "@/types/domains/booking";

type PaymentActionRequiredCardProps = {
  request: PaymentRequest;
};

export function PaymentActionRequiredCard({
  request,
}: PaymentActionRequiredCardProps) {
  const copy = CLIENT_PAYMENTS_COPY;

  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">
            {request.studioName ?? "Studio"}
          </p>
          <p className="mt-0.5 text-sm text-muted">{request.bookingTitle}</p>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-gold uppercase">
            {copy.requestType[request.type]}
          </p>
        </div>
        <p className="shrink-0 text-lg font-bold text-charcoal">
          {formatRwf(request.amount)}
        </p>
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
        <Clock className="size-4 text-gold" aria-hidden />
        {copy.dueBy(request.dueDate)}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="gold" className="shadow-card" asChild>
          <Link
            to={ROUTES.client.uploadReceiptForPayment(
              request.bookingId,
              request.id,
            )}
          >
            <Wallet className="size-4" aria-hidden />
            {copy.payNow}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to={ROUTES.client.bookingDetail(request.bookingId)}>
            View booking
          </Link>
        </Button>
      </div>

      {request.fullAmount > request.amount ? (
        <Link
          to={`${ROUTES.client.uploadReceiptForPayment(
            request.bookingId,
            request.id,
          )}&option=full`}
          className="mt-3 inline-block text-xs font-semibold text-muted transition-colors hover:text-gold"
        >
          {copy.payInFull(formatRwf(request.fullAmount))}
        </Link>
      ) : null}
    </article>
  );
}
