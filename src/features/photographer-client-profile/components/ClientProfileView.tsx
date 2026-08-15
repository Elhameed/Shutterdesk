import { useEffect, useState } from "react";
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
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { DetailPageSkeleton } from "@/components/skeletons";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";

type ClientProfileViewProps = {
  clientId: string;
};

export function ClientProfileView({ clientId }: ClientProfileViewProps) {
  const copy = CLIENT_PROFILE_COPY;
  const [profile, setProfile] = useState<ClientProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await photographerApi.clients.getProfile(clientId);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Unable to load client profile."));
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (showSkeleton) {
    return <DetailPageSkeleton sidebar="narrow" />;
  }

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Link
          to={ROUTES.photographer.clients}
          className="text-sm font-semibold text-gold hover:text-gold-hover"
        >
          {copy.backToClients}
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sm text-muted">{copy.notFound}</p>
        <Link
          to={ROUTES.photographer.clients}
          className="text-sm font-semibold text-gold hover:text-gold-hover"
        >
          {copy.backToClients}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full bg-gray-50/50 p-4 sm:p-6 lg:p-8">
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
            onSaved={(notes) =>
              setProfile((current) =>
                current ? { ...current, internalNotes: notes } : current,
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
