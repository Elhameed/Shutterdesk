/**
 * Format an amount as Rwandan Francs — e.g. `RWF 50,000`.
 *
 * Paired with the server's `format/currency-format.ts`; keep the two in step.
 * They had drifted — only this side rounded — so the same amount could render
 * differently depending on which side formatted it.
 */
export function formatRwf(amount: number): string {
  return `RWF ${Math.round(amount).toLocaleString("en-US")}`;
}
