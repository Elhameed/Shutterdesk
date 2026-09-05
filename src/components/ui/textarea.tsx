import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-border bg-panel text-ink flex min-h-[120px] w-full resize-y rounded-sm border px-4 py-3 text-sm",
          "placeholder:text-ink-faint",
          "focus-visible:border-accent focus-visible:ring-accent/25 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
