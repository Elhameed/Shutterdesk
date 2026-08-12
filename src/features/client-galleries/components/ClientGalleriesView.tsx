import { useMemo, useState } from "react";
import { PortalPageHeader } from "@/components/common/PortalPageHeader";
import { SearchField } from "@/components/common/SearchField";
import { CLIENT_GALLERIES_COPY } from "@/constants/client-galleries";
import {
  ClientGalleryCard,
  ClientNewSessionCard,
} from "@/features/client-galleries/components/ClientGalleryCard";
import { getQueryErrorMessage } from "@/lib/api-error";
import {
  useClientGalleries,
} from "@/hooks/queries/client";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ListPageSkeleton } from "@/components/skeletons";

export function ClientGalleriesView() {
  const copy = CLIENT_GALLERIES_COPY;
  const [search, setSearch] = useState("");
  const { data: galleries = [], isLoading, error } = useClientGalleries();
  const showSkeleton = useDelayedLoading(isLoading);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return galleries;
    return galleries.filter((g) => g.title.toLowerCase().includes(q));
  }, [galleries, search]);

  if (showSkeleton) {
    return <ListPageSkeleton variant="clientGallery" />;
  }

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-red-700" role="alert">
          {getQueryErrorMessage(error, "Unable to load galleries.")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <PortalPageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="mt-6 max-w-md">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={copy.searchPlaceholder}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted sm:col-span-2 xl:col-span-2">
            {copy.noResults}
          </p>
          <ClientNewSessionCard />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((gallery) => (
            <ClientGalleryCard key={gallery.id} gallery={gallery} />
          ))}
          <ClientNewSessionCard />
        </div>
      )}
    </div>
  );
}
