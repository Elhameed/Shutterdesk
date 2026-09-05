/**
 * App-wide badge color system.
 *
 * Four semantic tints, each a `*-tint` background with its matching `*-fg`
 * text. No raw color-scale utilities (green-50, yellow-700, …) — those are what
 * made status treatment drift screen to screen.
 *
 *   neutral — pending, draft, archived, inactive
 *   accent  — confirmed, active, upcoming, informational
 *   ok      — paid, delivered, approved, completed
 *   bad     — unpaid, cancelled, rejected, needs review
 *
 * These strings stay in sync with the `Badge` variants in
 * `@/components/ui/badge`; prefer that component for new work.
 */
const NEUTRAL = "bg-paper-dim text-ink-soft";
const ACCENT = "bg-accent-tint text-accent-fg";
const OK = "bg-ok-tint text-ok-fg";
const BAD = "bg-bad-tint text-bad-fg";
const OUTLINE = "border border-border-strong bg-transparent text-ink-soft";

export const PAYMENT_BADGE_STYLES = {
  paid: OK,
  partial: ACCENT,
  unpaid: BAD,
} as const;

export const BOOKING_STATUS_BADGE_STYLES = {
  pending: NEUTRAL,
  completed: OK,
  confirmed: ACCENT,
  cancelled: BAD,
  pendingVerification: NEUTRAL,
} as const;

export const SESSION_STATUS_BADGE_STYLES = {
  pending: NEUTRAL,
  completed: OK,
  confirmed: ACCENT,
  awaitingPayment: NEUTRAL,
  paid: OK,
} as const;

export const CLIENT_TIER_BADGE_STYLES = {
  vip: ACCENT,
  active: NEUTRAL,
  new: NEUTRAL,
} as const;

export const PROJECT_STATUS_BADGE_STYLES = {
  completed: OK,
  upcoming: ACCENT,
} as const;

export const SERVICE_BADGE_STYLES = {
  popular: ACCENT,
  featured: ACCENT,
  public: OUTLINE,
  private: NEUTRAL,
  new: OUTLINE,
  draft: NEUTRAL,
  archived: NEUTRAL,
} as const;

export const INVOICE_STATUS_BADGE_STYLES = {
  paid: OK,
  pending: NEUTRAL,
} as const;

export const VERIFICATION_STATUS_BADGE_STYLES = {
  pending: NEUTRAL,
  approved: OK,
  rejected: BAD,
} as const;

export const GALLERY_CATEGORY_BADGE_STYLES = {
  wedding: NEUTRAL,
  portrait: NEUTRAL,
  graduation: NEUTRAL,
  commercial: NEUTRAL,
} as const;

/**
 * These sit on top of photography, so they stay readable without competing
 * with the image: a solid ink chip rather than a bright fill.
 */
export const GALLERY_WORKFLOW_BADGE_STYLES = {
  delivered: "bg-accent text-panel",
  ready: "bg-ink/85 text-panel backdrop-blur-sm",
  editing: "bg-ink/55 text-panel backdrop-blur-sm",
} as const;

export const GALLERY_FOOTER_STATUS_STYLES = {
  delivered: "text-accent",
  ready: "text-ink-soft",
  editing: "text-ink-faint",
} as const;
