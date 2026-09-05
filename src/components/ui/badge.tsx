import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status pill. Always a `*-tint` background with its matching `*-fg` text —
 * never raw black or white on a tint, and never the accent used as a plain
 * decorative fill.
 *
 * Semantics:
 *   neutral — pending, draft, archived, inactive
 *   accent  — confirmed, active, upcoming, informational
 *   ok      — paid, delivered, approved, completed
 *   bad     — unpaid, cancelled, rejected, needs review
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-paper-dim text-ink-soft",
        accent: "bg-accent-tint text-accent-fg",
        ok: "bg-ok-tint text-ok-fg",
        bad: "bg-bad-tint text-bad-fg",
        outline: "border-border-strong text-ink-soft border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
