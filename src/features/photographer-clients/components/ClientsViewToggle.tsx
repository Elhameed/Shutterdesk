import { LayoutGrid, List } from "lucide-react";
import type { ClientViewMode } from "@/constants/photographer-clients";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { cn } from "@/lib/utils";

type ClientsViewToggleProps = {
  view: ClientViewMode;
  onChange: (view: ClientViewMode) => void;
};

const options: { value: ClientViewMode; label: string; icon: typeof LayoutGrid }[] =
  [
    { value: "card", label: CLIENTS_COPY.cardView, icon: LayoutGrid },
    { value: "list", label: CLIENTS_COPY.listView, icon: List },
  ];

export function ClientsViewToggle({ view, onChange }: ClientsViewToggleProps) {
  return (
    <div className="flex rounded-sm border border-border bg-paper-dim p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            view === value
              ? "bg-panel text-ink"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
