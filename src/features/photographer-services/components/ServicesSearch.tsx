import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SERVICES_COPY } from "@/constants/photographer-services";

type ServicesSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ServicesSearch({ value, onChange }: ServicesSearchProps) {
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
        placeholder={SERVICES_COPY.searchPlaceholder}
        className="h-11 bg-gray-50 pl-10"
        aria-label={SERVICES_COPY.searchPlaceholder}
      />
    </div>
  );
}
