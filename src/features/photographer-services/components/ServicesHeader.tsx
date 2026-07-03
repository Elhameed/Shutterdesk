import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhotographerPageHeader } from "@/components/photographer/PhotographerPageHeader";
import { SERVICES_COPY } from "@/constants/photographer-services";
import { ROUTES } from "@/constants/routes";

export function ServicesHeader() {
  const copy = SERVICES_COPY;

  return (
    <PhotographerPageHeader
      breakpoint="lg"
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <Button variant="default" size="sm" className="gap-2" asChild>
          <Link to={ROUTES.photographer.servicePackageNew}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{copy.addPackage}</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      }
    />
  );
}
