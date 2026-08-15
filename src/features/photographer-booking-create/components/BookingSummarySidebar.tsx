import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NEW_BOOKING_COPY } from "@/constants/photographer-booking-create";
import { landingAssets } from "@/constants/assets";
import { calculateBookingTotals } from "@/lib/booking-calculations";

type BookingSummarySidebarProps = {
  clientLabel: string;
  packageName: string;
  dateLabel: string;
  locationLabel: string;
  basePrice: number;
  deposit: number;
  applyTax: boolean;
  onCreate: () => void;
};

export function BookingSummarySidebar({
  clientLabel,
  packageName,
  dateLabel,
  locationLabel,
  basePrice,
  deposit,
  applyTax,
  onCreate,
}: BookingSummarySidebarProps) {
  const copy = NEW_BOOKING_COPY;
  const { subtotal, tax, total } = calculateBookingTotals(
    basePrice,
    deposit,
    applyTax,
  );

  return (
    <aside className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-card">
        <div className="relative h-28 bg-charcoal">
          <img
            src={landingAssets.experience.architecturePhoto}
            alt=""
            className="size-full object-cover opacity-60"
            aria-hidden
          />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal/80 to-charcoal/20" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
              {copy.reviewing}
            </span>
            <h2 className="mt-2 text-base font-bold text-white">
              {copy.bookingSummary}
            </h2>
          </div>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <SummaryRow label={copy.summaryClient} value={clientLabel} />
          <SummaryRow label={copy.summaryPackage} value={packageName} />
          <SummaryRow label={copy.summaryDate} value={dateLabel} />
          <SummaryRow label={copy.summaryLocation} value={locationLabel} />

          <div className="border-t border-border pt-4">
            <SummaryRow label={copy.subtotal} value={copy.money(subtotal)} />
            <SummaryRow
              label={copy.estimatedTax}
              value={copy.money(tax)}
              className="mt-2"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-charcoal">{copy.totalCost}</span>
              <span className="text-lg font-bold text-charcoal">
                {copy.money(total)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gold p-4 text-white">
            <p className="text-[10px] font-semibold tracking-wider text-white/80 uppercase">
              {copy.depositDueNow}
            </p>
            <p className="mt-1 text-xl font-bold">{copy.money(deposit)}</p>
            <p className="mt-1 text-xs text-white/80">{copy.depositNote}</p>
          </div>

          <Button variant="default" className="w-full" onClick={onCreate}>
            {copy.createAndSend}
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            {copy.inviteDisclaimer}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-border border-l-4 border-l-gold bg-gray-50 p-4">
        <div className="flex gap-3">
          <Lightbulb className="size-5 shrink-0 text-gold" aria-hidden />
          <div>
            <p className="text-sm font-bold text-charcoal">{copy.proTipTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {copy.proTipBody}
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-charcoal">{value}</span>
    </div>
  );
}
