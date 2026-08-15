import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";
import { formatClientCurrency } from "@/features/photographer-clients/lib/client-utils";
import { cn } from "@/lib/utils";

type FinancialSummaryCardProps = {
  financial: ClientProfileDetail["financial"];
};

export function FinancialSummaryCard({ financial }: FinancialSummaryCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
        {copy.financialSummary}
      </h2>

      <p className="mt-2 text-3xl font-bold text-charcoal">
        {formatClientCurrency(financial.totalRevenue)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">
          {copy.balance}:{" "}
          <span
            className={cn(
              "font-bold",
              financial.balance > 0 ? "text-red-600" : "text-green-600",
            )}
          >
            {formatClientCurrency(financial.balance)}
          </span>
        </span>
        <span className="text-muted">
          {copy.sessions}:{" "}
          <span className="font-bold text-charcoal">{financial.sessions}</span>
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">
        {copy.reliability}:{" "}
        <span className="font-bold text-green-600">
          {financial.reliability}%
        </span>
      </p>

      <p className="mt-3 text-xs italic text-muted">
        {copy.memberSince(financial.memberSince)}
      </p>
    </section>
  );
}
