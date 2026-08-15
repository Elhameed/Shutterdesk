import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PAYMENTS_COPY } from "@/constants/photographer-payments";

type PaymentsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PaymentsSearch({ value, onChange }: PaymentsSearchProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-light"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={PAYMENTS_COPY.searchPlaceholder}
        className="h-11 rounded-full bg-gray-50 pl-10"
        aria-label={PAYMENTS_COPY.searchPlaceholder}
      />
    </div>
  );
}
