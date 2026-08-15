import { Check } from "lucide-react";
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
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.title}
          </h2>
          <span className="text-sm font-bold text-gold">{percent}%</span>
        </div>

        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="space-y-4">
          {sortedItems.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-3 shrink-0 items-center justify-center rounded-full border",
                  item.completed
                    ? "border-muted-light bg-muted-light text-white"
                    : "border-muted-light bg-white",
                )}
              >
                {item.completed && (
                  <Check className="size-2" strokeWidth={3} aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "text-sm",
                  item.completed
                    ? "text-muted-light line-through"
                    : "font-medium text-charcoal",
                )}
              >
                {item.label}
                {item.optional ? (
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    (Optional)
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
