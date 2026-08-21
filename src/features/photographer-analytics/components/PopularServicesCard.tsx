import { ANALYTICS_COPY } from "@/constants/photographer-analytics";
import type { PopularServiceStat } from "@/types/domains/analytics";

export function PopularServicesCard({
  services,
}: {
  services: PopularServiceStat[];
}) {
  const copy = ANALYTICS_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-sm font-bold text-charcoal">{copy.popularServices}</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.serviceName}
              </th>
              <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.bookings}
              </th>
              <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                {copy.columns.revenueShare}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((service) => (
              <tr key={service.name}>
                <td className="py-3 text-sm font-semibold text-charcoal">
                  {service.name}
                </td>
                <td className="py-3 text-sm text-muted">{service.bookings}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-charcoal"
                        style={{ width: `${service.share}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-charcoal">
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
