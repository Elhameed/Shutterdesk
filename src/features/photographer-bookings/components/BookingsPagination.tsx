import { Pagination } from "@/components/common/Pagination";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";

type BookingsPaginationProps = {
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  totalBookings: number;
  onPageChange: (page: number) => void;
};

export function BookingsPagination({
  currentPage,
  totalPages,
  from,
  to,
  totalBookings,
  onPageChange,
}: BookingsPaginationProps) {
  const copy = BOOKINGS_COPY;

  if (totalBookings === 0) {
    return null;
  }

  return (
    <Pagination
      variant="footer"
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      summary={copy.showing(from, to, totalBookings)}
    />
  );
}
