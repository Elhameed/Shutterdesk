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
        <p className="text-sm font-semibold text-charcoal">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
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
          checked ? "bg-gold" : "bg-gray-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
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
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
