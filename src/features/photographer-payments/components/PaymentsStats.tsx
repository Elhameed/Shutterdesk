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
        subtextClassName="text-gold"
        icon={
          <span className="relative inline-flex text-gold">
            <ClipboardList className="size-4" aria-hidden />
            <Clock
              className="absolute -right-1 -bottom-1 size-2.5 rounded-full bg-gold-light"
              aria-hidden
            />
          </span>
        }
        iconClassName="bg-gold-light text-gold"
      />

      <StatCard
        label={copy.approvedToday}
        value={formatRwf(stats.approvedToday)}
        subtext={copy.approvedChange}
        subtextClassName="text-green-600"
        icon={<Banknote className="size-4" aria-hidden />}
        iconClassName="bg-gold-light text-gold"
        subtextIcon={<TrendingUp className="size-3" aria-hidden />}
      />

      <StatCard
        label={copy.rejectedThisWeek}
        value={String(stats.rejectedThisWeek)}
        subtext={copy.viewHistory}
        icon={<CircleX className="size-4" aria-hidden />}
        iconClassName="bg-gray-100 text-muted"
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
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
          {label}
        </p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-charcoal">
        {value}
      </p>

      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-xs font-medium",
          subtextClassName ?? "text-muted",
        )}
      >
        {subtextIcon}
        {subtext}
      </p>
    </div>
  );
}
