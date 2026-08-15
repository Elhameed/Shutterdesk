import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ServicePackageFormView } from "@/features/photographer-service-create/components/ServicePackageFormView";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { FormSkeleton } from "@/components/skeletons";
import {
  servicePackageToFormValues,
  type ServicePackageFormValues,
} from "@/types/domains/service";

export function EditServicePackageView() {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<ServicePackageFormValues | null>(
    null,
  );
  const [isDraftPackage, setIsDraftPackage] = useState(false);
  const [coverImage, setCoverImage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    void photographerApi.services.getById(id).then((service) => {
      if (service) {
        setInitialValues(servicePackageToFormValues(service));
        setCoverImage(service.hasCoverImage ? service.coverImage ?? undefined : undefined);
        setIsDraftPackage(
          !service.isActive || service.badges.includes("draft"),
        );
      }
      setIsLoading(false);
    });
  }, [id]);

  if (showSkeleton) {
    return <FormSkeleton fields={6} />;
  }

  if (isLoading) {
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
