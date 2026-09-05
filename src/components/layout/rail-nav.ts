/**
 * The single active-nav language for the app.
 *
 * Before the redesign there were three competing treatments for the same
 * concept — a gold left-border on an off-white rail, a solid black pill, and a
 * solid gold block — which is what made the portals feel like different
 * products. Both sidebars now import from here so they cannot drift again.
 *
 * Rail: dark surface. Active item: light text, a 2px accent left border, and a
 * barely-there white wash. No filled pills, no filled blocks.
 *
 * In-page secondary navigation (settings tabs and the like) uses
 * `PANEL_NAV_ITEM` below — the same idea on a light surface.
 */
import { cn } from "@/lib/utils";

/** Shared shape of a rail nav item. Pair with `railItemState`. */
export const RAIL_ITEM =
  "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors";

export function railItemState(isActive: boolean) {
  // `rail-accent`, not `accent`: the flat accent is near-invisible against the
  // rail background. Same hue, lifted for the inverted surface.
  return isActive
    ? "border-rail-accent text-rail-text-active bg-white/5"
    : "text-rail-text hover:text-rail-text-active border-transparent hover:bg-white/[0.03]";
}

/** Shared shape of the rail container. */
export const RAIL_SHELL =
  "bg-rail-bg flex h-screen w-60 shrink-0 flex-col";

/**
 * Secondary, in-page navigation on a light surface — settings tabs, panel
 * side-nav. Same language as the rail: an accent edge marks the active item,
 * never a fill.
 *
 * `orientation` picks which edge carries the accent: vertical lists get a left
 * border, horizontal tab strips get a bottom border.
 */
export const PANEL_NAV_ITEM =
  "flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors";

export function panelNavItemState(
  isActive: boolean,
  orientation: "vertical" | "horizontal" = "vertical",
) {
  const edge = orientation === "vertical" ? "border-l-2" : "border-b-2";

  return cn(
    edge,
    isActive
      ? "border-accent text-ink"
      : "text-ink-soft hover:text-ink border-transparent",
  );
}
