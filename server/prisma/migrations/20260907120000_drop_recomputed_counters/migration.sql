-- These four columns were stored counters that nothing ever maintained.
--
-- `clients.sessions`, `clients.revenue` and `clients.balance` were written once
-- at create (as zero) and never updated again. `service_packages.total_revenue`
-- was never written at all. Every read path recomputed the real figure from the
-- underlying bookings — except the create and update responses, which fell back
-- to the column and so reported zero. Renaming a service package made its
-- revenue appear to drop to nothing.
--
-- The mappers now require the computed values, so nothing reads these. Dropping
-- them rather than leaving dead columns behind, because a column that looks
-- like a counter invites the next person to trust it.
--
-- If any of these is ever wanted as a real stored aggregate, it needs a write
-- path that maintains it on every booking and payment change — not a default.
ALTER TABLE "clients" DROP COLUMN "sessions";
ALTER TABLE "clients" DROP COLUMN "revenue";
ALTER TABLE "clients" DROP COLUMN "balance";

ALTER TABLE "service_packages" DROP COLUMN "total_revenue";
