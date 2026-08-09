import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { ROUTES } from "@/constants/routes";

type GalleriesHeaderProps = {
  totalCount: number;
};

export function GalleriesHeader({ totalCount }: GalleriesHeaderProps) {
  const copy = GALLERIES_COPY;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{copy.totalCount(totalCount)}</p>
      </div>

      <Button variant="default" size="sm" className="shrink-0 gap-2" asChild>
        <Link to={ROUTES.photographer.galleryNew}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">{copy.addNewGallery}</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </Button>
    </div>
  );
}
