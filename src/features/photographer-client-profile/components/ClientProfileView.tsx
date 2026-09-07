import { Link } from "react-router-dom";
import { ClientActivityTabs } from "@/features/photographer-client-profile/components/ClientActivityTabs";
import { ClientProfileBreadcrumbs } from "@/features/photographer-client-profile/components/ClientProfileBreadcrumbs";
import { ClientProfileHeader } from "@/features/photographer-client-profile/components/ClientProfileHeader";
import { FinancialSummaryCard } from "@/features/photographer-client-profile/components/FinancialSummaryCard";
import { InsightsCard } from "@/features/photographer-client-profile/components/InsightsCard";
import { InternalMemoCard } from "@/features/photographer-client-profile/components/InternalMemoCard";
import { PreferencesCard } from "@/features/photographer-client-profile/components/PreferencesCard";
import { QuickActionsCard } from "@/features/photographer-client-profile/components/QuickActionsCard";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { ROUTES } from "@/constants/routes";
import { getQueryErrorMessage } from "@/lib/api-error";
import { usePhotographerClientProfile } from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DetailPageSkeleton } from "@/components/skeletons";

type ClientProfileViewProps = {
  clientId: string;
};

export function ClientProfileView({ clientId }: ClientProfileViewProps) {
  const copy = CLIENT_PROFILE_COPY;
  const {
    data: profile,
    isPending,
    error: queryError,
  } = usePhotographerClientProfile(clientId);

  const showSkeleton = useDelayedLoading(isPending);
  const error = queryError
    ? getQueryErrorMessage(queryError, "Unable to load client profile.")
    : null;

  if (showSkeleton) {
    return <DetailPageSkeleton sidebar="narrow" />;
  }

  if (isPending) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-bad-fg">{error}</p>
        <Link
          to={ROUTES.photographer.clients}
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {copy.backToClients}
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-ink-soft">{copy.notFound}</p>
        <Link
          to={ROUTES.photographer.clients}
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {copy.backToClients}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full bg-paper-dim/50 p-4 sm:p-6 lg:p-8">
      <ClientProfileBreadcrumbs clientName={profile.name} />

      <div className="mt-4">
        <ClientProfileHeader profile={profile} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)]">
        <div className="space-y-5">
          <FinancialSummaryCard financial={profile.financial} />
          <InsightsCard insights={profile.insights} />
          <QuickActionsCard clientId={profile.id} clientName={profile.name} />
        </div>

        <div className="min-w-0">
          <ClientActivityTabs
            timeline={profile.timeline}
            projects={profile.projects}
            invoices={profile.invoices}
            galleries={profile.galleries}
          />
        </div>

        <div className="space-y-5">
          <PreferencesCard preferences={profile.preferences} />
          <InternalMemoCard
            clientId={profile.id}
            initialNotes={profile.internalNotes}
          />
        </div>
      </div>
    </div>
  );
}
