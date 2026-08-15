import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rounded?: "default" | "pill";
};

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  rounded = "default",
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 bg-gray-50 pl-10",
          rounded === "pill" && "rounded-full",
        )}
      />
    </div>
  );
}
