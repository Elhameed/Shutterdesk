import { useState } from "react";
import { Eye, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";
import { ROUTES } from "@/constants/routes";
import { getApiErrorMessage } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { photographerApi } from "@/services/photographer";
import type { Booking } from "@/types/domains/booking";

type BookingActionsProps = {
  bookingId: string;
  actions: Booking["actions"];
  onActionError?: (message: string) => void;
};

export function BookingActions({
  bookingId,
  actions,
  onActionError,
}: BookingActionsProps) {
  const copy = BOOKINGS_COPY;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const stopClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const viewBooking = () => {
    navigate(ROUTES.photographer.bookingDetail(bookingId));
  };

  async function refreshBookings() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.photographer.bookings });
  }

  async function handleCancel() {
    if (isUpdating || !actions.canCancel) return;

    setIsUpdating(true);
    try {
      await photographerApi.bookings.updateStatus(bookingId, "cancelled");
      await refreshBookings();
      setCancelOpen(false);
    } catch (error) {
      onActionError?.(
        getApiErrorMessage(error, copy.cancelBookingFailed),
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5" onClick={stopClick}>
      {actions.canView && (
        <Tooltip label={copy.viewBooking}>
          <button
            type="button"
            onClick={viewBooking}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-charcoal"
            aria-label={copy.viewBooking}
          >
            <Eye className="size-4" />
          </button>
        </Tooltip>
      )}

      {actions.canCancel && (
        <Tooltip label={copy.declineBooking}>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => setCancelOpen(true)}
            className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={copy.declineBooking}
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </Tooltip>
      )}
      </div>

      <AlertDialog
        open={cancelOpen}
        title={copy.declineBooking}
        description={copy.cancelBookingConfirm}
        confirmLabel={copy.declineBooking}
        destructive
        isLoading={isUpdating}
        onConfirm={() => void handleCancel()}
        onCancel={() => setCancelOpen(false)}
      />
    </>
  );
}
