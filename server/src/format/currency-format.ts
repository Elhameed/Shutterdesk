/**
 * Format an amount as Rwandan Francs — e.g. `RWF 50,000`.
 *
 * Money is stored as integer RWF, so rounding is normally a no-op here; it
 * matters for computed figures like averages. Kept identical to the client's
 * `src/lib/currency.ts`, which is the paired copy — the two had drifted, with
 * only the client rounding, so the same amount could render differently
 * depending on which side formatted it.
 *
 * These stay separate because the shared contract module is types-only: a
 * runtime function there would be bundled into the browser.
 */
export function formatRwf(amount: number): string {
  return `RWF ${Math.round(amount).toLocaleString("en-US")}`;
}
