import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Only one filled `default` button per view or section — everything else is
 * `secondary`, `outline` or `ghost`. The accent marks the single primary
 * action; used as a general fill it stops signalling anything.
 */
const buttonVariants = cva(
  "focus-visible:ring-accent inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent text-on-accent hover:bg-accent-hover",
        /** @deprecated legacy name for the primary action — use `default`. */
        gold: "bg-accent text-on-accent hover:bg-accent-hover",
        secondary:
          "border-border-strong text-ink hover:bg-paper-dim border bg-transparent",
        outline:
          "border-border-strong text-ink hover:bg-paper-dim border bg-transparent",
        ghost: "text-ink hover:bg-paper-dim",
        /**
         * Primary action on a dark surface (rail, dark landing sections). The
         * flat accent fill is only ~2:1 against `rail-bg`, so the button shape
         * dissolves into the background — this uses the rail-adapted accent.
         */
        "on-dark": "bg-rail-accent text-rail-bg hover:bg-rail-accent/90",
        "outline-light":
          "border border-white/40 bg-transparent text-white hover:bg-white/10",
        auth: "bg-accent text-on-accent hover:bg-accent-hover",
        link: "text-accent hover:text-accent-hover underline-offset-4 hover:underline",
        destructive: "bg-bad text-on-accent hover:bg-bad/90",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
