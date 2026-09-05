import { Info } from "lucide-react";
import { formatRwf } from "@/lib/currency";

type AmountDueBannerProps = {
  amount: number;
  invoiceRef: string;
};

export function AmountDueBanner({ amount, invoiceRef }: AmountDueBannerProps) {
  return (
    <section className="mt-6 rounded-md border border-border bg-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-medium text-ink-faint">
            Amount Due
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {formatRwf(amount)}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-sm border border-border bg-paper-dim px-3 py-2 text-xs font-semibold text-ink">
          <Info className="size-4 text-accent" aria-hidden />
          {invoiceRef}
        </div>
      </div>
    </section>
  );
}
