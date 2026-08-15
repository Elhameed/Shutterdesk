import { formatRwf } from "@/lib/currency";

export const PAYMENTS_COPY = {
  title: "Payment Verification",
  subtitle: "Review and validate incoming client bank transfers and receipts.",
  searchPlaceholder: "Search by client, booking, or amount...",
  stats: {
    pendingVerifications: "Pending Verifications",
    highPriority: (count: number) => `${count} high priority`,
    approvedToday: "Approved Today",
    approvedChange: "+18% from yesterday",
    rejectedThisWeek: "Rejected This Week",
    viewHistory: "View history",
  },
  queueTitle: "Verification Queue",
  filter: "Filter",
  columns: {
    client: "Client",
    booking: "Booking",
    amount: "Amount",
    receipt: "Receipt",
    status: "Status",
  },
  detail: {
    title: "Payment Detail",
    receiptEvidence: "Receipt Evidence",
    expand: "Expand",
    transactionId: "Transaction ID",
    client: "Client",
    bookingDate: "Booking Date",
    package: "Package",
    totalFee: "Total Fee",
    approvePayment: "Approve Payment",
    rejectPayment: "Reject Payment",
    requestNewReceipt: "Request New Receipt Compliance",
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
