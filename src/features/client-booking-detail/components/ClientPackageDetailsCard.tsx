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
    <section className="relative overflow-hidden rounded-md border border-border bg-panel p-5">
      <span
        className="absolute inset-y-0 right-0 w-1 bg-accent"
        aria-hidden
      />

      <h2 className="text-base font-bold text-ink">{copy.packageDetails}</h2>
      <p className="mt-3 font-semibold text-ink">{packageInfo.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{packageInfo.subtitle}</p>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[10px] font-medium text-ink-faint">
          {copy.totalPrice}
        </p>
        <p className="mt-1 text-2xl font-bold text-ink">
          {formatRwf(packageInfo.price)}
        </p>
      </div>
    </section>
  );
}
