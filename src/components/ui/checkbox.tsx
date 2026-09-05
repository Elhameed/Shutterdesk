import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "border-border accent-accent size-4 shrink-0 rounded-sm border",
          "focus-visible:ring-accent/25 focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Checkbox.displayName = "Checkbox";
