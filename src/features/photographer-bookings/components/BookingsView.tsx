import { useEffect, useMemo, useState } from "react";
import { BookingsFilterTabs } from "@/features/photographer-bookings/components/BookingsFilterTabs";
import { BookingsHeader } from "@/features/photographer-bookings/components/BookingsHeader";
import { BookingsSearch } from "@/features/photographer-bookings/components/BookingsSearch";
import { BookingsTable } from "@/features/photographer-bookings/components/BookingsTable";
import {
  filterBookings,
  getBookingFilterCounts,
  searchBookings,
} from "@/features/photographer-bookings/lib/booking-utils";
import type { BookingFilter } from "@/constants/photographer-bookings";
import { BOOKINGS_PAGE_SIZE } from "@/constants/photographer-bookings";
import { getQueryErrorMessage } from "@/lib/api-error";
import {
  usePhotographerBookings,
} from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { TableRowsSkeleton } from "@/components/skeletons";
import { paginateSlice } from "@/lib/pagination";

export function BookingsView() {
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: bookings = [], isLoading, error } = usePhotographerBookings();
  const showSkeleton = useDelayedLoading(isLoading);

  const filterCounts = useMemo(() => getBookingFilterCounts(bookings), [bookings]);

  const filteredBookings = useMemo(() => {
    const byStatus = filterBookings(bookings, activeFilter);
    return searchBookings(byStatus, searchQuery);
  }, [bookings, activeFilter, searchQuery]);

  const pagination = useMemo(
    () => paginateSlice(filteredBookings, currentPage, BOOKINGS_PAGE_SIZE),
    [filteredBookings, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const errorMessage = error
    ? getQueryErrorMessage(error, "Unable to load bookings.")
    : null;

  return (
    <div className="min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      <BookingsHeader />

      <div className="mt-6">
        <BookingsSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="mt-4">
        <BookingsFilterTabs
          active={activeFilter}
          counts={filterCounts}
          onChange={setActiveFilter}
        />
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {actionError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mt-4">
        {showSkeleton ? (
          <TableRowsSkeleton rows={BOOKINGS_PAGE_SIZE} />
        ) : isLoading ? null : (
          <BookingsTable
            bookings={pagination.items}
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            from={pagination.from}
            to={pagination.to}
            totalBookings={pagination.total}
            onPageChange={setCurrentPage}
            onActionError={setActionError}
          />
        )}
      </div>
    </div>
  );
}
