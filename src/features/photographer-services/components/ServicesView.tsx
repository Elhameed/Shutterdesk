import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { SERVICES_COPY } from "@/constants/photographer-services";
import { ServicesGrid } from "@/features/photographer-services/components/ServicesGrid";
import { ServicesHeader } from "@/features/photographer-services/components/ServicesHeader";
import { ServicesSearch } from "@/features/photographer-services/components/ServicesSearch";
import { getApiErrorMessage } from "@/lib/api-error";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { ListPageSkeleton } from "@/components/skeletons";
import {
  searchServicePackages,
  type ServicePackage,
} from "@/types/domains/service";

export function ServicesView() {
  const copy = SERVICES_COPY;
  const { push } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServicePackage | null>(null);

  const refreshPackages = useCallback(async () => {
    const data = await photographerApi.services.list();
    setPackages(data);
  }, []);

  useEffect(() => {
    void refreshPackages().finally(() => setIsLoading(false));
  }, [refreshPackages]);

  const filteredPackages = useMemo(
    () => searchServicePackages(packages, searchQuery),
    [packages, searchQuery],
  );

  const handleDuplicate = async (service: ServicePackage) => {
    setDuplicatingId(service.id);
    try {
      const duplicated = await photographerApi.services.duplicate(service.id);
      await refreshPackages();
      push({
        title: copy.duplicateSuccessTitle,
        description: copy.duplicateSuccessDescription(duplicated.title),
        variant: "success",
      });
    } catch (error) {
      push({
        title: copy.duplicateErrorTitle,
        description: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      await photographerApi.services.delete(deleteTarget.id);
      setPackages((current) => current.filter((pkg) => pkg.id !== deleteTarget.id));
      setDeleteTarget(null);
      push({
        title: copy.deleteSuccessTitle,
        description: copy.deleteSuccessDescription(deleteTarget.title),
        variant: "success",
      });
    } catch (error) {
      push({
        title: copy.deleteErrorTitle,
        description: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (showSkeleton) {
    return <ListPageSkeleton variant="service" />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <ServicesHeader />

      <div className="mt-6">
        <ServicesSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mt-4">
        <ServicesGrid
          packages={filteredPackages}
          onDuplicate={(service) => void handleDuplicate(service)}
          onDelete={setDeleteTarget}
          duplicatingId={duplicatingId}
          deletingId={deletingId}
        />
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        title={copy.deleteConfirmTitle}
        description={
          deleteTarget ? copy.deleteConfirmDescription(deleteTarget.title) : ""
        }
        confirmLabel={copy.delete}
        destructive
        isLoading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
