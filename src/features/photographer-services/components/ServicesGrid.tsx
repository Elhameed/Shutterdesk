import { SERVICES_COPY } from "@/constants/photographer-services";
import { ServicePackageCard } from "@/features/photographer-services/components/ServicePackageCard";
import type { ServicePackage } from "@/types/domains/service";

type ServicesGridProps = {
  packages: ServicePackage[];
  onDuplicate?: (service: ServicePackage) => void;
  onDelete?: (service: ServicePackage) => void;
  duplicatingId?: string | null;
  deletingId?: string | null;
};

export function ServicesGrid({
  packages,
  onDuplicate,
  onDelete,
  duplicatingId = null,
  deletingId = null,
}: ServicesGridProps) {
  if (packages.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted">
        {SERVICES_COPY.noPackagesFound}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {packages.map((service) => (
        <ServicePackageCard
          key={service.id}
          service={service}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          isDuplicating={duplicatingId === service.id}
          isDeleting={deletingId === service.id}
        />
      ))}
    </div>
  );
}
