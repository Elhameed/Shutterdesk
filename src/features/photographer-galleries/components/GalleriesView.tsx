import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GALLERIES_COPY,
  type GalleryCategoryFilter,
  type GallerySortOption,
  type GalleryStatusFilter,
} from "@/constants/photographer-galleries";
import { GalleriesFilterBar } from "@/features/photographer-galleries/components/GalleriesFilterBar";
import { GalleriesGrid } from "@/features/photographer-galleries/components/GalleriesGrid";
import { GalleriesHeader } from "@/features/photographer-galleries/components/GalleriesHeader";
import { GalleriesSearch } from "@/features/photographer-galleries/components/GalleriesSearch";
import { getQueryErrorMessage } from "@/lib/api-error";
import {
  usePhotographerGalleries,
} from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ListPageSkeleton } from "@/components/skeletons";
import {
  GALLERY_LIST_PAGE_SIZE,
  filterGalleries,
  searchGalleries,
  sortGalleries,
} from "@/types/domains/gallery";
import { ROUTES } from "@/constants/routes";

export function GalleriesView() {
  const copy = GALLERIES_COPY;
  const [searchParams] = useSearchParams();
  const clientFilterId = searchParams.get("client");
  const { data: galleries = [], isLoading, error } = usePhotographerGalleries();
  const showSkeleton = useDelayedLoading(isLoading);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<GalleryCategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<GalleryStatusFilter>("all");
  const [sortBy, setSortBy] = useState<GallerySortOption>("dateUploaded");
  const [visibleCount, setVisibleCount] = useState(GALLERY_LIST_PAGE_SIZE);

  const filteredGalleries = useMemo(() => {
    const searched = searchGalleries(galleries, searchQuery);
    const filtered = filterGalleries(
      searched,
      categoryFilter,
      statusFilter,
      clientFilterId,
    );
    return sortGalleries(filtered, sortBy);
  }, [
    galleries,
    searchQuery,
    categoryFilter,
    statusFilter,
    sortBy,
    clientFilterId,
  ]);

  const filteredClientName = useMemo(() => {
    if (!clientFilterId) return null;
    return (
      galleries.find((gallery) => gallery.clientId === clientFilterId)
        ?.clientName ?? null
    );
  }, [clientFilterId, galleries]);

  const visibleGalleries = filteredGalleries.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGalleries.length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(GALLERY_LIST_PAGE_SIZE);
  };

  const handleFilterChange = () => {
    setVisibleCount(GALLERY_LIST_PAGE_SIZE);
  };

  if (showSkeleton) {
    return <ListPageSkeleton variant="gallery" count={GALLERY_LIST_PAGE_SIZE} />;
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
      <GalleriesHeader totalCount={galleries.length} />

      {clientFilterId && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
          <p className="text-sm text-charcoal">
            {filteredClientName
              ? copy.showingClientGalleries(filteredClientName)
              : copy.noClientGalleries("this client")}
          </p>
          <Link
            to={ROUTES.photographer.galleries}
            className="text-sm font-semibold text-gold hover:text-gold-hover"
          >
            {copy.clearClientFilter}
          </Link>
        </div>
      )}

      <div className="mt-6">
        <GalleriesSearch value={searchQuery} onChange={handleSearchChange} />
      </div>

      <div className="mt-4">
        <GalleriesFilterBar
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onCategoryChange={(value) => {
            setCategoryFilter(value);
            handleFilterChange();
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            handleFilterChange();
          }}
          onSortChange={setSortBy}
        />
      </div>

      <div className="mt-5">
        <GalleriesGrid
          galleries={visibleGalleries}
          emptyMessage={
            clientFilterId && filteredClientName
              ? copy.noClientGalleries(filteredClientName)
              : undefined
          }
        />
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            className="min-w-[240px] rounded-xl"
            onClick={() =>
              setVisibleCount((count) => count + GALLERY_LIST_PAGE_SIZE)
            }
          >
            {copy.loadMore}
          </Button>
        </div>
      )}
    </div>
  );
}
