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
    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-ink text-2xl">
          {copy[timeOfDay]}, {user.firstName}
        </h1>
        <p className="text-ink-soft mt-1 text-sm">{copy.subtitle}</p>
      </div>
      {actions}
    </div>
  );
}
