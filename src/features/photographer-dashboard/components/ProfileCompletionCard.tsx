import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import type { PhotographerDashboardSummary } from "@/types/domains/dashboard";
import { cn } from "@/lib/utils";

type ProfileCompletionCardProps = {
  profileCompletion: PhotographerDashboardSummary["profileCompletion"];
};

export function ProfileCompletionCard({
  profileCompletion,
}: ProfileCompletionCardProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.profileCompletion;
  const { percent, items } = profileCompletion;
  const sortedItems = [...items].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? -1 : 1;
  });

  return (
    <section className="min-w-0">
      <Card className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-ink text-sm font-semibold">{copy.title}</h2>
          {/* One of the few places the accent carries a number — it is the
              single call to action in this card. */}
          <span className="font-display text-accent text-sm">{percent}%</span>
        </div>

        <div className="bg-paper-dim mt-2.5 mb-3 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-2.5">
          {sortedItems.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                  item.completed
                    ? "border-ok bg-ok text-panel"
                    : "border-border-strong",
                )}
              >
                {item.completed && (
                  <Check className="size-2" strokeWidth={3} aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "text-xs",
                  item.completed ? "text-ink-faint" : "text-ink",
                )}
              >
                {item.label}
                {item.optional ? (
                  <span className="text-ink-faint ml-1.5">(optional)</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
