import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "border-border bg-panel text-ink flex h-12 w-full appearance-none rounded-sm border px-4 pr-10 text-sm",
            "focus-visible:border-accent focus-visible:ring-accent/25 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-ink-faint pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
          aria-hidden
        />
      </div>
    );
  },
);
Select.displayName = "Select";
