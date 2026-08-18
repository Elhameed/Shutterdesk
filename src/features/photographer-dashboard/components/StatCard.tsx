import { Calendar, Camera, Clipboard, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: "camera" | "calendar" | "users" | "clipboard";
  tone?: "default" | "alert";
};

const iconMap = {
  camera: Camera,
  calendar: Calendar,
  users: Users,
};

function PendingPaymentsIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <Clipboard className="size-4" aria-hidden />
      <Clock
        className="absolute -right-1 -bottom-1 size-2.5 rounded-full bg-white"
        aria-hidden
      />
    </span>
  );
}

export function StatCard({
  label,
  value,
  change,
  subtext,
  icon,
  tone = "default",
}: StatCardProps) {
  const isAlert = tone === "alert";
  const Icon = icon !== "clipboard" ? iconMap[icon] : null;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
          {label}
        </p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isAlert ? "text-red-500" : "bg-gold-light text-gold",
          )}
        >
          {Icon ? (
            <Icon className="size-4" aria-hidden />
          ) : (
            <PendingPaymentsIcon />
          )}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-charcoal">
        {value}
      </p>

      {change && (
        <p className="mt-1 text-xs font-medium text-gold">{change}</p>
      )}

      {subtext && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            isAlert ? "text-red-500" : "text-muted",
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
