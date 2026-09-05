import { formatRwf } from "@/lib/currency";

export const PAYMENTS_COPY = {
  title: "Payment verification",
  subtitle: "Review and validate incoming client bank transfers and receipts.",
  searchPlaceholder: "Search by client, booking, or amount...",
  stats: {
    pendingVerifications: "Pending verifications",
    highPriority: (count: number) => `${count} high priority`,
    approvedToday: "Approved today",
    approvedChange: "+18% from yesterday",
    rejectedThisWeek: "Rejected this week",
    viewHistory: "View history",
  },
  queueTitle: "Verification queue",
  filter: "Filter",
  columns: {
    client: "Client",
    booking: "Booking",
    amount: "Amount",
    receipt: "Receipt",
    status: "Status",
  },
  detail: {
    title: "Payment detail",
    receiptEvidence: "Receipt evidence",
    expand: "Expand",
    transactionId: "Transaction ID",
    client: "Client",
    bookingDate: "Booking date",
    package: "Package",
    totalFee: "Total fee",
    approvePayment: "Approve payment",
    rejectPayment: "Reject payment",
    requestNewReceipt: "Request new receipt compliance",
    requestNewReceiptSuccess:
      "Receipt resubmission request sent to the client.",
    requestNewReceiptError:
      "Unable to request a new receipt. Please try again.",
  },
  status: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  showing: (from: number, to: number, total: number) =>
    `Showing ${from} to ${to} of ${total} pending requests`,
  noResults: "No payment verifications found for this search.",
  amountDisplay: (amount: number) => formatRwf(amount),
  feeDisplay: (amount: number) => formatRwf(amount),
} as const;
