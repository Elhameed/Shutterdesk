/**
 * App-wide badge color system.
 *
 * Payment:  Green = Paid · Yellow = Partial · Red = Unpaid
 * Status:   Gray = Pending · Blue = Completed · Gold = Confirmed
 */
export const PAYMENT_BADGE_STYLES = {
  paid: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
  unpaid: "bg-red-50 text-red-600",
} as const;

export const BOOKING_STATUS_BADGE_STYLES = {
  pending: "bg-gray-100 text-charcoal",
  completed: "bg-blue-50 text-blue-700",
  confirmed: "bg-gold-light text-gold",
  cancelled: "bg-red-50 text-red-600",
  pendingVerification: "bg-yellow-50 text-yellow-700",
} as const;

export const SESSION_STATUS_BADGE_STYLES = {
  pending: "bg-gray-100 text-charcoal",
  completed: "bg-blue-50 text-blue-700",
  confirmed: "bg-gold-light text-gold",
  awaitingPayment: "bg-yellow-50 text-yellow-700",
  paid: "bg-green-50 text-green-700",
} as const;

export const CLIENT_TIER_BADGE_STYLES = {
  vip: "bg-gold-light text-gold",
  active: "bg-gray-100 text-charcoal",
  new: "bg-gray-100 text-charcoal",
} as const;

export const PROJECT_STATUS_BADGE_STYLES = {
  completed: "bg-white text-charcoal shadow-sm",
  upcoming: "bg-gold-light text-gold",
} as const;

export const SERVICE_BADGE_STYLES = {
  popular: "bg-gold-light text-charcoal",
  featured: "bg-gold-light text-charcoal",
  public: "bg-charcoal text-white",
  private: "bg-charcoal text-white",
  new: "border border-border bg-white text-charcoal",
  draft: "border border-border bg-gray-100 text-muted",
  archived: "border border-border bg-gray-100 text-muted",
} as const;

export const INVOICE_STATUS_BADGE_STYLES = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-orange-50 text-orange-600",
} as const;

export const VERIFICATION_STATUS_BADGE_STYLES = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
} as const;

export const GALLERY_CATEGORY_BADGE_STYLES = {
  wedding: "bg-gold-light text-charcoal",
  portrait: "bg-blue-50 text-blue-700",
  graduation: "bg-orange-50 text-orange-600",
  commercial: "bg-purple-50 text-purple-700",
} as const;

export const GALLERY_WORKFLOW_BADGE_STYLES = {
  delivered: "bg-green-500 text-white",
  ready: "bg-gold text-charcoal",
  editing: "bg-white/80 text-charcoal backdrop-blur-sm",
} as const;

export const GALLERY_FOOTER_STATUS_STYLES = {
  delivered: "text-green-600",
  ready: "text-gold",
  editing: "text-muted",
} as const;
