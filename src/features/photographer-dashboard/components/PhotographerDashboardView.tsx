import { Link } from "react-router-dom";
import { LocalTimeBadge } from "@/components/common/LocalTimeBadge";
import { DashboardGreeting } from "@/features/photographer-dashboard/components/DashboardGreeting";
import { ProfileCompletionCard } from "@/features/photographer-dashboard/components/ProfileCompletionCard";
import { QuickActionsSection } from "@/features/photographer-dashboard/components/QuickActionsSection";
import { RecentActivityCard } from "@/features/photographer-dashboard/components/RecentActivityCard";
import { StatCard } from "@/features/photographer-dashboard/components/StatCard";
import { UpcomingShootsTable } from "@/features/photographer-dashboard/components/UpcomingShootsTable";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { ROUTES } from "@/constants/routes";
import {
  getQueryErrorMessage,
} from "@/lib/api-error";
import {
  usePhotographerDashboard,
} from "@/hooks/queries/photographer";
import { PhotographerDashboardSkeleton } from "@/components/skeletons";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

export function PhotographerDashboardView() {
  const shootsCopy = PHOTOGRAPHER_DASHBOARD_COPY.upcomingShoots;
  const quickActionsCopy = PHOTOGRAPHER_DASHBOARD_COPY.quickActions;
  const { data: dashboard, isLoading, error } = usePhotographerDashboard();
  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return <PhotographerDashboardSkeleton />;
  }

  if (isLoading) {
    return null;
  }

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <p className="max-w-md text-center text-sm text-red-700" role="alert">
          {getQueryErrorMessage(error, "Unable to load your dashboard.")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <DashboardGreeting user={dashboard.user} actions={<LocalTimeBadge />} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            subtext={stat.subtext}
            icon={stat.icon}
            tone={stat.tone ?? "default"}
          />
        ))}
      </div>

      <div className="mt-6 min-w-0">
        <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
          <h2 className="text-base font-bold text-charcoal">
            {shootsCopy.title}
          </h2>
          <Link
            to={ROUTES.photographer.calendar}
            className="text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
          >
            {shootsCopy.viewCalendar}
          </Link>
        </div>

        <div className="mb-4 hidden items-center gap-6 lg:grid lg:grid-cols-[7fr_3fr]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-bold text-charcoal">
              {shootsCopy.title}
            </h2>
            <Link
              to={ROUTES.photographer.calendar}
              className="text-xs font-semibold text-gold transition-colors hover:text-gold-hover"
            >
              {shootsCopy.viewCalendar}
            </Link>
          </div>
          <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
            {quickActionsCopy.title}
          </h2>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[7fr_3fr] lg:items-start">
          <UpcomingShootsTable
            showHeader={false}
            shoots={dashboard.upcomingShoots}
          />
          <div className="min-w-0 space-y-6">
            <h2 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase lg:hidden">
              {quickActionsCopy.title}
            </h2>
            <QuickActionsSection showHeader={false} />
            <ProfileCompletionCard profileCompletion={dashboard.profileCompletion} />
            <RecentActivityCard activities={dashboard.recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
