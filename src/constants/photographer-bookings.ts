export const BOOKINGS_COPY = {
  title: "Bookings management",
  subtitle: "Organize and process your upcoming photography sessions.",
  advancedFilter: "Advanced filter",
  newBooking: "New booking",
  searchPlaceholder: "Search bookings...",
  filters: {
    all: "All bookings",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  columns: {
    client: "Client",
    servicePackage: "Service package",
    dateTime: "Date & time",
    payment: "Payment",
    status: "Status",
    actions: "Actions",
  },
  payment: {
    paid: "Paid",
    partial: "Partial",
    unpaid: "Unpaid",
  },
  status: {
    confirmed: "Confirmed",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  showing: (from: number, to: number, total: number) =>
    `Showing ${from} to ${to} of ${total} bookings`,
  viewBooking: "View booking",
  approveBooking: "Approve booking",
  cancelBooking: "Cancel booking",
  cancelBookingConfirm:
    "Cancel this booking? The client will be notified. This cannot be undone.",
  cancelBookingFailed: "Unable to cancel booking. It may already have a deposit on file.",
  declineBooking: "Decline booking",
} as const;

export type BookingFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export const BOOKINGS_PAGE_SIZE = 10;
