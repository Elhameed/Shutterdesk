import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CLIENTS_COPY } from "@/constants/photographer-clients";

type ClientsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ClientsSearch({ value, onChange }: ClientsSearchProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={CLIENTS_COPY.searchPlaceholder}
        className="h-11 bg-paper-dim pl-10"
        aria-label={CLIENTS_COPY.searchPlaceholder}
      />
    </div>
  );
}
