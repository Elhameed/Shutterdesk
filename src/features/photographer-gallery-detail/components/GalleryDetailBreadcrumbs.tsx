import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { ROUTES } from "@/constants/routes";

type GalleryDetailBreadcrumbsProps = {
  galleryTitle: string;
};

export function GalleryDetailBreadcrumbs({
  galleryTitle,
}: GalleryDetailBreadcrumbsProps) {
  const copy = GALLERIES_COPY;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted"
    >
      <Link
        to={ROUTES.photographer.galleries}
        className="transition-colors hover:text-charcoal"
      >
        {copy.title}
      </Link>
      <ChevronRight className="size-3.5" aria-hidden />
      <span className="font-medium text-charcoal">{galleryTitle}</span>
    </nav>
  );
}
