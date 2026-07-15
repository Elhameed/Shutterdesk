export const BOOKINGS_COPY = {
  title: "Bookings Management",
  subtitle: "Organize and process your upcoming photography sessions.",
  advancedFilter: "Advanced Filter",
  newBooking: "New Booking",
  searchPlaceholder: "Search bookings...",
  filters: {
    all: "All Bookings",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  columns: {
    client: "Client",
    servicePackage: "Service Package",
    dateTime: "Date & Time",
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
  viewBooking: "View Booking",
  approveBooking: "Approve Booking",
  cancelBooking: "Cancel Booking",
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
