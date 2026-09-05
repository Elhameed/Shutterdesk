import { FrameCell } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: "camera" | "calendar" | "users" | "clipboard";
  tone?: "default" | "alert";
};

/**
 * A single cell in the dashboard stat frame — render inside a `FrameGrid`,
 * which supplies the surrounding border and the 1px dividers between cells.
 *
 * The label is sentence case at normal tracking rather than the old
 * fixed-width all-caps treatment, which was what truncated longer labels into
 * "MONTHLY REVE" and "ACTIVE BOOKIN".
 *
 * `icon` is still accepted so callers and the dashboard payload are unchanged,
 * but the reference design carries no icon here: the number is the signal, and
 * a tinted icon chip in every cell was decorative weight competing with it.
 */
export function StatCard({
  label,
  value,
  change,
  subtext,
  tone = "default",
}: StatCardProps) {
  const isAlert = tone === "alert";

  return (
    <FrameCell className="min-w-0">
      <p className="text-ink-soft text-xs">{label}</p>

      <p className="font-display text-ink mt-2 text-2xl">{value}</p>

      {change && <p className="text-ok-fg mt-1 text-[11px]">{change}</p>}

      {subtext && (
        <p
          className={cn(
            "mt-1 text-[11px]",
            isAlert ? "text-bad-fg" : "text-ink-faint",
          )}
        >
          {subtext}
        </p>
      )}
    </FrameCell>
  );
}
