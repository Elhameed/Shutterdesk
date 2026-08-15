import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { ROUTES } from "@/constants/routes";

type ClientProfileBreadcrumbsProps = {
  clientName: string;
};

export function ClientProfileBreadcrumbs({
  clientName,
}: ClientProfileBreadcrumbsProps) {
  const copy = CLIENT_PROFILE_COPY;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted"
    >
      <Link
        to={ROUTES.photographer.clients}
        className="transition-colors hover:text-charcoal"
      >
        {copy.breadcrumbClients}
      </Link>
      <ChevronRight className="size-3.5" aria-hidden />
      <span className="font-medium text-charcoal">{clientName}</span>
    </nav>
  );
}
