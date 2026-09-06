/**
 * The API contract, declared once and consumed by both halves.
 *
 * Types only — see README.md in this directory for why, and for why this lives
 * under `server/src` rather than a root-level package.
 */

export type * from "./enums.js";
export type * from "./booking.js";
export type * from "./error.js";
export type * from "./user.js";

// The client calls this `BookingPrimaryAction`; the server calls the same shape
// `LifecyclePrimaryAction`. Both names are exported so neither side had to be
// renamed wholesale, but they are one type.
export type { LifecyclePrimaryAction as BookingPrimaryAction } from "./booking.js";
