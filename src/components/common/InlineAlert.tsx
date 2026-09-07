import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  error: "bg-bad-tint text-bad-fg",
  success: "bg-ok-tint text-ok-fg",
  info: "bg-accent-tint text-accent-fg",
} as const;

type InlineAlertProps = {
  children: ReactNode;
  variant?: keyof typeof VARIANT_STYLES;
  className?: string;
};

/**
 * A short message shown in place, next to whatever it is about — a failed save,
 * a validation problem, a confirmation.
 *
 * This markup was written out by hand in roughly fifteen views and had drifted
 * into four variants: some with a border, some without, different class
 * orderings, and — the reason this is not purely cosmetic — only some carrying
 * `role="alert"`. Screen readers announced an error on some screens and stayed
 * silent on others. It is always announced now.
 *
 * For transient feedback that is not tied to a spot on the page, use the toast
 * from `components/ui/toast` instead.
 */
export function InlineAlert({
  children,
  variant = "error",
  className,
}: InlineAlertProps) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-sm px-4 py-3 text-sm",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </p>
  );
}
