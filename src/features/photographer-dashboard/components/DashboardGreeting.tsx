import type { ReactNode } from "react";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import type { PhotographerDashboardSummary } from "@/types/domains/dashboard";

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

type DashboardGreetingProps = {
  user: PhotographerDashboardSummary["user"];
  actions?: ReactNode;
};

export function DashboardGreeting({ user, actions }: DashboardGreetingProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.greeting;
  const timeOfDay = getTimeOfDay();

  return (
    <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy[timeOfDay]}, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">{copy.subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
