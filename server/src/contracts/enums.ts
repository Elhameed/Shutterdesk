/**
 * The Prisma enums, as string unions.
 *
 * Re-declared rather than imported from `@prisma/client` because the frontend
 * resolves this directory directly — importing the generated client here would
 * drag Prisma into the browser bundle.
 *
 * The server asserts these stay in step with the schema: see
 * `tests/contract-enums.test.ts`, which fails if an enum gains or loses a
 * member without this file being updated.
 */

export type UserRole = "photographer" | "client";

export type ClientTier = "vip" | "active" | "new";

export type ClientCategory = "wedding" | "commercial" | "portrait" | "editorial";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingPaymentStatus = "unpaid" | "partial" | "paid";

export type PaymentRequestType = "deposit" | "balance" | "full";

export type PaymentRequestStatus = "unpaid" | "pending" | "approved" | "rejected";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type GalleryCategory = "wedding" | "portrait" | "graduation" | "commercial";

export type GalleryStatus = "draft" | "published" | "archived";

export type GalleryWorkflowStatus = "editing" | "ready" | "delivered";

