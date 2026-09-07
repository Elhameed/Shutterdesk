import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";

type FinancialSummaryCardProps = {
  financial: ClientProfileDetail["financial"];
};

export function FinancialSummaryCard({ financial }: FinancialSummaryCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="text-[10px] font-medium text-ink-faint">
        {copy.financialSummary}
      </h2>

      <p className="mt-2 text-3xl font-bold text-ink">
        {formatRwf(financial.totalRevenue)}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-ink-soft">
          {copy.balance}:{" "}
          <span
            className={cn(
              "font-bold",
              financial.balance > 0 ? "text-bad-fg" : "text-ok-fg",
            )}
          >
            {formatRwf(financial.balance)}
          </span>
        </span>
        <span className="text-ink-soft">
          {copy.sessions}:{" "}
          <span className="font-bold text-ink">{financial.sessions}</span>
        </span>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        {copy.reliability}:{" "}
        <span className="font-bold text-ok-fg">
          {financial.reliability}%
        </span>
      </p>

      <p className="mt-3 text-xs italic text-ink-soft">
        {copy.memberSince(financial.memberSince)}
      </p>
    </section>
  );
}
