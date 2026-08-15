import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PhotographerPageHeader } from "@/components/photographer/PhotographerPageHeader";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";
import { ROUTES } from "@/constants/routes";

export function BookingsHeader() {
  const copy = BOOKINGS_COPY;

  return (
    <PhotographerPageHeader
      title={copy.title}
      subtitle={copy.subtitle}
      actions={
        <Button variant="default" size="sm" className="gap-2" asChild>
          <Link to={ROUTES.photographer.bookingsNew}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{copy.newBooking}</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      }
    />
  );
}
