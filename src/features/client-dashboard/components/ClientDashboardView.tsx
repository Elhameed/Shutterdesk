import {
  CalendarCheck,
  Clock,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { CLIENT_DASHBOARD_COPY } from "@/constants/client-dashboard";
import { DashboardAside } from "@/features/client-dashboard/components/DashboardAside";
import { DashboardStatCard } from "@/features/client-dashboard/components/DashboardStatCard";
import { GalleryReadyCard } from "@/features/client-dashboard/components/GalleryReadyCard";
import { LocalTimeBadge } from "@/components/common/LocalTimeBadge";
import { RecentUpdatesCard } from "@/features/client-dashboard/components/RecentUpdatesCard";
import { UpcomingSessionCard } from "@/features/client-dashboard/components/UpcomingSessionCard";
import { formatRwf } from "@/lib/currency";
import { getQueryErrorMessage } from "@/lib/api-error";
import {
  useClientDashboard,
} from "@/hooks/queries/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ClientDashboardSkeleton } from "@/components/skeletons";

export function ClientDashboardView() {
  const copy = CLIENT_DASHBOARD_COPY;
  const { user } = useAuth();
  const { data, isLoading, error } = useClientDashboard();
  const showSkeleton = useDelayedLoading(isLoading);

  if (showSkeleton) {
    return <ClientDashboardSkeleton />;
  }

  if (isLoading) {
    return null;
  }

  if (error || !data) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-red-700" role="alert">
          {getQueryErrorMessage(error, "Unable to load your dashboard.")}
        </p>
      </div>
    );
  }

  const { stats, outstandingTotal, paymentObligations, upcomingDetail, readyGallery } =
    data;

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader
        title={copy.greeting(user?.fullName ?? "there")}
        subtitle={copy.subtitle}
        actions={<LocalTimeBadge />}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label={copy.stats.activeBookings}
          value={String(stats.activeBookings)}
          icon={CalendarCheck}
          tag={stats.activeBookings > 0 ? copy.stats.statusTag : undefined}
        />
        <DashboardStatCard
          label={copy.stats.upcomingSessions}
          value={String(stats.upcomingSessions)}
          icon={Clock}
        />
        <DashboardStatCard
          label={copy.stats.galleriesAvailable}
          value={String(stats.galleriesAvailable)}
          icon={ImageIcon}
        />
        <DashboardStatCard
          label={copy.stats.pendingPayments}
          value={formatRwf(stats.pendingPayments)}
          icon={CreditCard}
          alert={stats.pendingPayments > 0}
        />
      </div>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[7fr_3fr] lg:items-start">
        <div className="min-w-0 space-y-4">
          {upcomingDetail ? (
            <UpcomingSessionCard
              title={upcomingDetail.sessionLabel}
              date={upcomingDetail.event.date}
              venue={upcomingDetail.event.venue}
              bookingId={upcomingDetail.id}
            />
          ) : (
            <section className="rounded-xl border border-dashed border-border bg-white p-6 text-center shadow-card">
              <p className="text-sm font-semibold text-charcoal">
                {copy.noUpcomingSession}
              </p>
              <p className="mt-1 text-xs text-muted">
                Book a session to see your next shoot here.
              </p>
            </section>
          )}

          {readyGallery ? (
            <GalleryReadyCard
              title={readyGallery.title}
              photoCount={readyGallery.photoCount}
              galleryId={readyGallery.id}
            />
          ) : (
            <section className="rounded-xl border border-dashed border-border bg-white p-6 text-center shadow-card">
              <p className="text-sm font-semibold text-charcoal">
                {copy.galleryReady}
              </p>
              <p className="mt-1 text-xs text-muted">
                Your delivered galleries will appear here when ready.
              </p>
            </section>
          )}

          <RecentUpdatesCard />
        </div>

        <DashboardAside balance={outstandingTotal} obligations={paymentObligations} />
      </div>
    </div>
  );
}
