/** Format amounts as Rwandan Franc (RWF) — e.g. RWF 50,000 */
export function formatRwf(amount: number): string {
  return `RWF ${Math.round(amount).toLocaleString("en-US")}`;
}
