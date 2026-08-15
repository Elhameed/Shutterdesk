import { Info } from "lucide-react";
import { formatRwf } from "@/lib/currency";

type AmountDueBannerProps = {
  amount: number;
  invoiceRef: string;
};

export function AmountDueBanner({ amount, invoiceRef }: AmountDueBannerProps) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
            Amount Due
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            {formatRwf(amount)}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-gray-50 px-3 py-2 text-xs font-semibold text-charcoal">
          <Info className="size-4 text-gold" aria-hidden />
          {invoiceRef}
        </div>
      </div>
    </section>
  );
}
