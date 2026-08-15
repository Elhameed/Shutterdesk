import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { BookingsVolumePoint } from "@/types/domains/analytics";

type BookingsVolumeCardProps = {
  data: BookingsVolumePoint[];
  totalBookings: number;
};

export function BookingsVolumeCard({ data, totalBookings }: BookingsVolumeCardProps) {
  const copy = ANALYTICS_COPY;
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-charcoal">{copy.bookingsVolume}</h2>
        <p className="text-xs font-medium text-muted">
          {copy.totalShoots(totalBookings)}
        </p>
      </div>

      <div className="mt-6 flex h-48 items-end justify-between gap-2 border-b border-border pb-6">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center justify-end gap-2"
          >
            <div
              className="w-full max-w-8 rounded-t-sm bg-gray-200"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] font-medium text-muted">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
