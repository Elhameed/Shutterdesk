import { Link } from "react-router-dom";
import {
  CheckCircle2,
  CirclePlus,
  Image as ImageIcon,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_DASHBOARD_COPY } from "@/constants/client-dashboard";
import { ROUTES } from "@/constants/routes";
import { CLIENT_SUPPORT_EMAIL } from "@/constants/support";
import { formatRwf } from "@/lib/currency";
import type { PaymentRequest } from "@/types/domains/booking";

type DashboardAsideProps = {
  balance: number;
  obligations: PaymentRequest[];
};

export function DashboardAside({ balance, obligations }: DashboardAsideProps) {
  const copy = CLIENT_DASHBOARD_COPY;
  const unpaid = obligations;
  const isUpToDate = balance <= 0;

  const payLink =
    unpaid.length === 1
      ? ROUTES.client.uploadReceiptForPayment(
          unpaid[0].bookingId,
          unpaid[0].id,
        )
      : ROUTES.client.payments;

  const uploadLink =
    unpaid.length === 1
      ? ROUTES.client.uploadReceiptForPayment(
          unpaid[0].bookingId,
          unpaid[0].id,
        )
      : unpaid.length > 1
        ? ROUTES.client.payments
        : ROUTES.client.payments;

  return (
    <aside className="space-y-4">
      <section className="rounded-md border border-border bg-panel p-5">
        <p className="text-center text-[11px] font-medium text-ink-faint">
          {copy.outstandingBalance}
        </p>
        <p className="mt-3 text-center text-4xl font-bold tracking-tight text-ink">
          {formatRwf(balance)}
        </p>

        {isUpToDate ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-accent">
            <CheckCircle2 className="size-3.5" aria-hidden />
            {copy.accountUpToDate}
          </p>
        ) : (
          <>
            {unpaid.length > 1 ? (
              <p className="mt-2 text-center text-xs text-ink-soft">
                {unpaid.length} payments due across{" "}
                {new Set(unpaid.map((item) => item.studioId)).size} studios
              </p>
            ) : null}
            <Button className="mt-4 w-full" size="sm" asChild>
              <Link to={payLink}>
                {unpaid.length > 1 ? "View payments due" : copy.payNow}
              </Link>
            </Button>
          </>
        )}

        <div className="mt-4 border-t border-border pt-4 text-center">
          <Link
            to={ROUTES.client.payments}
            className="text-xs font-semibold text-ink transition-colors hover:text-accent"
          >
            {copy.viewBilling}
          </Link>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <h2 className="text-[11px] font-medium text-ink-faint">
          {copy.quickActions.title}
        </h2>
        <div className="mt-5 flex flex-col gap-3 sm:mt-6">
          <Button
            variant="gold"
            className="h-auto w-full rounded-md px-4 py-3 sm:px-5 sm:py-3.5"
            asChild
          >
            <Link to={ROUTES.client.bookSession}>
              <CirclePlus className="size-4" aria-hidden />
              {copy.quickActions.bookSession}
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-auto w-full rounded-md px-4 py-3 sm:px-5 sm:py-3.5"
            asChild
          >
            <Link to={uploadLink}>
              <Receipt className="size-4" aria-hidden />
              {copy.quickActions.uploadReceipt}
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-auto w-full rounded-md px-4 py-3 sm:px-5 sm:py-3.5"
            asChild
          >
            <Link to={ROUTES.client.galleries}>
              <ImageIcon className="size-4" aria-hidden />
              {copy.quickActions.viewGalleries}
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-md bg-paper-dim p-5">
        <h2 className="text-sm font-bold text-ink">
          {copy.needHelp.title}
        </h2>
        <p className="mt-1 text-xs text-ink-soft">{copy.needHelp.body}</p>
        <a
          href={`mailto:${CLIENT_SUPPORT_EMAIL}`}
          className="mt-3 inline-block text-xs font-semibold text-ink transition-colors hover:text-accent"
        >
          {copy.needHelp.cta} ›
        </a>
      </section>
    </aside>
  );
}
