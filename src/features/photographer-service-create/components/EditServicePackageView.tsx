import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ServicePackageFormView } from "@/features/photographer-service-create/components/ServicePackageFormView";
import { usePhotographerServiceDetail } from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { FormSkeleton } from "@/components/skeletons";
import {
  servicePackageToFormValues,
} from "@/types/domains/service";

export function EditServicePackageView() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isPending } = usePhotographerServiceDetail(id);
  const showSkeleton = useDelayedLoading(isPending);

  // The form owns its own state from these seed values onward, so only the
  // fetch moves to Query — editing a field must not be a cache write.
  const initialValues = service ? servicePackageToFormValues(service) : null;
  const coverImage = service?.hasCoverImage
    ? (service.coverImage ?? undefined)
    : undefined;
  const isDraftPackage = service
    ? !service.isActive || service.badges.includes("draft")
    : false;

  if (showSkeleton) {
    return <FormSkeleton fields={6} />;
  }

  if (isPending) {
    return null;
  }

  if (!id || !initialValues) {
    return <Navigate to={ROUTES.photographer.services} replace />;
  }

  return (
    <ServicePackageFormView
      mode="edit"
      serviceId={id}
      initialValues={initialValues}
      coverImage={coverImage}
      isDraftPackage={isDraftPackage}
    />
  );
}
