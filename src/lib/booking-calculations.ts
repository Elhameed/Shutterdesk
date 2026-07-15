/** Rwanda VAT — optional on photographer-created bookings */
export const BOOKING_TAX_RATE = 0.18;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "momo", label: "Mobile Money (MoMo)" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
] as const;

export function calculateBookingTotals(
  basePrice: number,
  deposit: number,
  applyTax: boolean,
) {
  const tax = applyTax ? basePrice * BOOKING_TAX_RATE : 0;
  const total = basePrice + tax;

  return { subtotal: basePrice, tax, total, deposit };
}
