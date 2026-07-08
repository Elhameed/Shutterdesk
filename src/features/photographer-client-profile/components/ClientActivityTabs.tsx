import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClientGalleriesTab } from "@/features/photographer-client-profile/components/ClientGalleriesTab";
import { ClientInvoicesTab } from "@/features/photographer-client-profile/components/ClientInvoicesTab";
import { ClientProjectsTab } from "@/features/photographer-client-profile/components/ClientProjectsTab";
import { ClientTimelineTab } from "@/features/photographer-client-profile/components/ClientTimelineTab";
import {
  CLIENT_PROFILE_COPY,
  type ClientProfileTab,
} from "@/constants/photographer-client-profile";
import type {
  ClientGallery,
  ClientInvoice,
  ClientProject,
  ClientTimelineEvent,
} from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

const tabs: ClientProfileTab[] = [
  "timeline",
  "projects",
  "invoices",
  "galleries",
];

function isClientProfileTab(value: string | null): value is ClientProfileTab {
  return value !== null && tabs.includes(value as ClientProfileTab);
}

type ClientActivityTabsProps = {
  timeline: ClientTimelineEvent[];
  projects: ClientProject[];
  invoices: ClientInvoice[];
  galleries: ClientGallery[];
};

export function ClientActivityTabs({
  timeline,
  projects,
  invoices,
  galleries,
}: ClientActivityTabsProps) {
  const copy = CLIENT_PROFILE_COPY;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ClientProfileTab>(
    isClientProfileTab(tabParam) ? tabParam : "timeline",
  );

  useEffect(() => {
    if (isClientProfileTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  function handleTabChange(tab: ClientProfileTab) {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={cn(
              "-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold capitalize transition-colors",
              activeTab === tab
                ? "border-charcoal text-charcoal"
                : "border-transparent text-muted hover:text-charcoal",
            )}
          >
            {copy.tabs[tab]}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeTab === "timeline" && <ClientTimelineTab events={timeline} />}
        {activeTab === "projects" && <ClientProjectsTab projects={projects} />}
        {activeTab === "invoices" && <ClientInvoicesTab invoices={invoices} />}
        {activeTab === "galleries" && (
          <ClientGalleriesTab galleries={galleries} />
        )}
      </div>
    </section>
  );
}
