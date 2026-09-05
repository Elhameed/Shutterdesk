import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-panel shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

type GalleryTabSectionProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

export function GalleryTabSection({
  title,
  children,
  action,
}: GalleryTabSectionProps) {
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-medium text-ink-faint">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
