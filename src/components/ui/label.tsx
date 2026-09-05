import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-ink-soft text-xs font-medium",
          className,
        )}
        {...props}
      >
        {children}
        {required && <span className="text-bad"> *</span>}
      </label>
    );
  },
);
Label.displayName = "Label";
