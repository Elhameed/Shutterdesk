import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Card — one hairline-bordered frame on the panel surface.
 *
 * Deliberately shadowless: the design language uses 1px borders and shared
 * dividers rather than stacked drop shadows, so cards read as framed regions
 * of the page instead of a pile of floating rounded boxes.
 */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-panel border-border rounded-md border", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/** Card header — separated from the body by a shared 1px divider. */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-border flex items-center justify-between gap-4 border-b px-4 pt-3.5 pb-3",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-ink text-sm font-semibold", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-ink-soft text-xs", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-border flex items-center gap-3 border-t px-4 py-3",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * FrameGrid — one outer bordered frame whose cells are separated by 1px
 * dividers, achieved with a 1px grid gap over a border-colored background.
 *
 * This is the stat/metric grid and quick-actions pattern: a single frame with
 * internal rules, not N individually bordered cards sitting next to each other.
 * Children should carry their own `bg-panel` (see FrameCell).
 */
export const FrameGrid = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-border border-border grid gap-px overflow-hidden rounded-md border",
      className,
    )}
    {...props}
  />
));
FrameGrid.displayName = "FrameGrid";

/** A single cell inside a FrameGrid. */
export const FrameCell = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-panel p-4", className)} {...props} />
));
FrameCell.displayName = "FrameCell";
