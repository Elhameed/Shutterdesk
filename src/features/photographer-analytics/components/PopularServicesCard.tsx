import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { PopularServiceStat } from "@/types/domains/analytics";

export function PopularServicesCard({
  services,
}: {
  services: PopularServiceStat[];
}) {
  const copy = ANALYTICS_COPY;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="text-sm font-bold text-ink">{copy.popularServices}</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.columns.serviceName}
              </th>
              <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.columns.bookings}
              </th>
              <th className="pb-3 text-left text-[11px] font-medium text-ink-faint">
                {copy.columns.revenueShare}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((service) => (
              <tr key={service.name}>
                <td className="py-3 text-sm font-semibold text-ink">
                  {service.name}
                </td>
                <td className="py-3 text-sm text-ink-soft">{service.bookings}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-dim">
                      <div
                        className="h-full rounded-full bg-ink"
                        style={{ width: `${service.share}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-ink">
                      {service.share}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
