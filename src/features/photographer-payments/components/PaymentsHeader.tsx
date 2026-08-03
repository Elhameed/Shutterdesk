import { PAYMENTS_COPY } from "@/constants/photographer-payments";
import { PaymentsSearch } from "@/features/photographer-payments/components/PaymentsSearch";

type PaymentsHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function PaymentsHeader({
  searchQuery,
  onSearchChange,
}: PaymentsHeaderProps) {
  const copy = PAYMENTS_COPY;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{copy.subtitle}</p>
      </div>

      <div className="w-full shrink-0 lg:w-80">
        <PaymentsSearch value={searchQuery} onChange={onSearchChange} />
      </div>
    </div>
  );
}
