import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import { formatRwf } from "@/lib/currency";
import type { BookingDetail } from "@/types/domains/booking";

type ClientPackageDetailsCardProps = {
  packageInfo: BookingDetail["package"];
};

export function ClientPackageDetailsCard({
  packageInfo,
}: ClientPackageDetailsCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-card">
      <span
        className="absolute inset-y-0 right-0 w-1 bg-gold"
        aria-hidden
      />

      <h2 className="text-base font-bold text-charcoal">{copy.packageDetails}</h2>
      <p className="mt-3 font-semibold text-charcoal">{packageInfo.title}</p>
      <p className="mt-1 text-sm text-muted">{packageInfo.subtitle}</p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.totalPrice}
        </p>
        <p className="mt-1 text-2xl font-bold text-charcoal">
          {formatRwf(packageInfo.price)}
        </p>
      </div>
    </section>
  );
}
