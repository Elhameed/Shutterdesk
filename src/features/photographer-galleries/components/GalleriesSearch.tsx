import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";

type GalleriesSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function GalleriesSearch({
  value,
  onChange,
  placeholder = GALLERIES_COPY.searchPlaceholder,
}: GalleriesSearchProps) {
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
        placeholder={placeholder}
        className="h-11 bg-paper-dim pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}
