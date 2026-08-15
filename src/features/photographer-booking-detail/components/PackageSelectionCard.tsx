import { Check } from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { formatRwf } from "@/lib/currency";
import type { BookingDetail } from "@/types/domains/booking";

type PackageSelectionCardProps = {
  packageInfo: BookingDetail["package"];
};

export function PackageSelectionCard({ packageInfo }: PackageSelectionCardProps) {
  const copy = BOOKING_DETAIL_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-charcoal">
            {copy.packageSelection}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{packageInfo.subtitle}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-charcoal">
            {formatRwf(packageInfo.price)}
          </p>
          <p className="text-[10px] text-muted">{copy.allTaxesIncluded}</p>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {packageInfo.includes.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-charcoal">
            <Check
              className="mt-0.5 size-4 shrink-0 text-gold"
              strokeWidth={3}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
