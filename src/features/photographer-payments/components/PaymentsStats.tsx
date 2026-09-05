import type { ReactNode } from "react";
import {
  Banknote,
  CircleX,
  ClipboardList,
  Clock,
  TrendingUp,
} from "lucide-react";
import { PAYMENTS_COPY } from "@/constants/photographer-payments";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  computePaymentStats,
  type PaymentVerification,
} from "@/types/domains/payment";

type PaymentsStatsProps = {
  verifications: PaymentVerification[];
};

export function PaymentsStats({ verifications }: PaymentsStatsProps) {
  const copy = PAYMENTS_COPY.stats;
  const stats = computePaymentStats(verifications);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label={copy.pendingVerifications}
        value={String(stats.pendingCount)}
        subtext={copy.highPriority(stats.highPriorityCount)}
        subtextClassName="text-accent"
        icon={
          <span className="relative inline-flex text-accent">
            <ClipboardList className="size-4" aria-hidden />
            <Clock
              className="absolute -right-1 -bottom-1 size-2.5 rounded-full bg-accent-tint"
              aria-hidden
            />
          </span>
        }
        iconClassName="bg-accent-tint text-accent"
      />

      <StatCard
        label={copy.approvedToday}
        value={formatRwf(stats.approvedToday)}
        subtext={copy.approvedChange}
        subtextClassName="text-ok-fg"
        icon={<Banknote className="size-4" aria-hidden />}
        iconClassName="bg-accent-tint text-accent"
        subtextIcon={<TrendingUp className="size-3" aria-hidden />}
      />

      <StatCard
        label={copy.rejectedThisWeek}
        value={String(stats.rejectedThisWeek)}
        subtext={copy.viewHistory}
        icon={<CircleX className="size-4" aria-hidden />}
        iconClassName="bg-paper-dim text-ink-soft"
        subtextIcon={<Clock className="size-3" aria-hidden />}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  subtextClassName,
  icon,
  iconClassName,
  subtextIcon,
}: {
  label: string;
  value: string;
  subtext: string;
  subtextClassName?: string;
  icon: ReactNode;
  iconClassName: string;
  subtextIcon?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium text-ink-faint">
          {label}
        </p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sm",
            iconClassName,
          )}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">
        {value}
      </p>

      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-xs font-medium",
          subtextClassName ?? "text-ink-soft",
        )}
      >
        {subtextIcon}
        {subtext}
      </p>
    </div>
  );
}
