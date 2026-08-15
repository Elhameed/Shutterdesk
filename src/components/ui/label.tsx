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
          "text-xs font-semibold uppercase tracking-[0.12em] text-muted",
          className,
        )}
        {...props}
      >
        {children}
        {required && <span className="text-gold"> *</span>}
      </label>
    );
  },
);
Label.displayName = "Label";
