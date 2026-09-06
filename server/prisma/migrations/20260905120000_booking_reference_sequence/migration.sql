-- Booking references used to be derived by loading every row in `bookings`,
-- regexing out the numeric suffix and taking the max. That is a full table scan
-- on every booking create, and it races: two concurrent creates read the same
-- max and produce the same reference, which then trips the unique constraint.
--
-- A sequence gives both properties for free.
CREATE SEQUENCE IF NOT EXISTS booking_reference_seq AS BIGINT START WITH 7741;

-- Advance the sequence past anything already issued so we never collide with
-- existing history. `setval` sets last_value, so the next `nextval` returns
-- one more than this — matching the old `max + 1` behaviour, including the
-- 7740 floor that made the first reference BK-7741.
SELECT setval(
  'booking_reference_seq',
  GREATEST(
    7740,
    COALESCE(
      (
        SELECT MAX(SUBSTRING(reference FROM '^BK-([0-9]+)$')::BIGINT)
        FROM bookings
        WHERE reference ~ '^BK-[0-9]+$'
      ),
      7740
    )
  )
);
