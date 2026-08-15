import { cn } from "@/lib/utils";

type InterestChipsProps = {
  options: readonly string[];
  selected: string[];
  onToggle: (interest: string) => void;
  label: string;
};

export function InterestChips({
  options,
  selected,
  onToggle,
  label,
}: InterestChipsProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => onToggle(interest)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-border bg-white text-charcoal hover:border-muted",
              )}
            >
              {interest}
            </button>
          );
        })}
      </div>
    </div>
  );
}
