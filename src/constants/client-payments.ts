import { formatRwf } from "@/lib/currency";

export const CLIENT_PAYMENTS_PAGE_SIZE = 3;

export const CLIENT_PAYMENTS_COPY = {
  title: "Payments",
  subtitle: "View payment obligations and upload transfer receipts.",
  uploadReceipt: "Upload receipt",
  actionRequired: "Action required",
  actionRequiredSubtitle: (count: number) =>
    count === 1
      ? "1 payment needs your attention"
      : `${count} payments need your attention`,
  payNow: "Pay now",
  payInFull: (amount: string) => `Pay full amount (${amount})`,
  dueBy: (date: string) => `Due by ${date}`,
  payViaMomo: "Pay via MoMo",
  downloadInvoice: "Download invoice",
  momoInstructions: "MoMo instructions",
  bankInstructions: "Bank transfer details",
  bankTransferHint: "Transfer the amount due to this bank account.",
  bankAccountName: "Account name",
  bankAccountNumber: "Account number",
  paymentMethods: {
    title: "Payment method",
    mobileMoney: "Mobile money",
    bankTransfer: "Bank transfer",
    noneConfigured:
      "This studio has not configured payment methods yet. Please contact your photographer.",
  },
  merchantCode: "Merchant code",
  momoNumber: "MoMo number",
  businessName: "Business name",
  referenceNote: "Reference",
  paymentHistory: "Payment history",
  filterAllStudios: "All studios",
  showingPayments: (from: number, to: number, total: number) =>
    `Showing ${from}–${to} of ${total} payments`,
  columns: {
    studio: "Studio",
    booking: "Booking",
    amount: "Amount",
    date: "Date",
    status: "Status",
    action: "Action",
  },
  status: {
    pending: "Pending verification",
    approved: "Approved",
    rejected: "Rejected",
  },
  requestType: {
    deposit: "Deposit",
    balance: "Balance",
    full: "Full payment",
  },
  viewReceipt: "View receipt",
  noPayments: "No payment records yet.",
  noActionRequired: "You're all caught up — no payments due right now.",
  totalDue: "Total due across studios",
  obligationsAcrossStudios: (count: number) =>
    `${count} payments due across multiple studios`,
  promo: {
    premium: {
      title: "Premium experience",
      body: "We value your investment in quality.",
    },
    secure: {
      title: "Secure transactions",
      body: "Encrypted payments via MoMo gateway.",
    },
  },
  upload: {
    title: "Confirm your payment",
    subtitle: "Secure your booking by providing proof of payment.",
    paymentOptionTitle: "Choose how much to pay",
    payDeposit: "Pay deposit",
    payBalance: "Pay balance",
    payFull: "Pay full amount",
    depositHint: "Secure your booking now and pay the balance later.",
    balanceHint: "Settle the remaining balance on your booking.",
    fullHint: "Settle the entire booking in a single payment.",
    payingLabel: "Paying",
    forLabel: "For",
    amountDue: "Amount due",
    bookingLabel: "Booking",
    amountLabel: "Amount (RWF)",
    amountPlaceholder: "325000",
    receiptLabel: "Upload receipt",
    receiptHint:
      "Drag & drop your receipt here. Supports PDF, JPG, or PNG (Max 10MB)",
    browseFiles: "Browse files",
    submit: "Submit payment",
    cancel: "Cancel",
    securedNote: "Secured with 256-bit encryption",
    totalPayment: "Total payment",
    instructionsTitle: "Payment instructions",
    instructionsMomo: [
      "Send the amount due to the studio's Mobile Money number.",
      "Take a clear screenshot or save the PDF confirmation of your transaction.",
      "Upload the file below and click Submit Payment.",
    ],
    instructionsBank: [
      "Transfer the amount due to the studio bank account shown.",
      "Include your booking reference in the transfer description.",
      "Upload a screenshot or PDF of your transfer confirmation, then submit.",
    ],
    verificationNote:
      "The photographer will verify the receipt before the booking is officially confirmed in your portal.",
    momoPayTitle: "Pay via MoMo",
    fullDetailsLink: "Back to payments",
    copied: "Copied to clipboard",
  },
  amountDisplay: (amount: number) => formatRwf(amount),
} as const;
