import { cn } from "@/lib/utils";

type SettingsToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  variant?: "gold" | "charcoal";
};

export function SettingsToggle({
  checked,
  onChange,
  label,
  variant = "gold",
}: SettingsToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked
          ? variant === "charcoal"
            ? "bg-ink"
            : "bg-accent"
          : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-panel shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
