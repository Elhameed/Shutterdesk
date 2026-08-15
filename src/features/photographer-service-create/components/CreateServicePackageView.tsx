import { getDefaultServiceFormValues } from "@/types/domains/service";
import { ServicePackageFormView } from "@/features/photographer-service-create/components/ServicePackageFormView";

export function CreateServicePackageView() {
  return (
    <ServicePackageFormView
      mode="create"
      initialValues={getDefaultServiceFormValues()}
    />
  );
}
