-- `likes` was never written by any code path — it only ever held its default of
-- 0. It was still read and fed into the gallery engagement rate as
-- `round(likes / max(views,1) * 100) + 24`, which therefore always evaluated to
-- exactly 24 and was presented to photographers as a measured figure.
--
-- Dropping the column rather than leaving it as a permanent zero, so nothing
-- can quietly start depending on it again. Favouriting, if it is built later,
-- should land as a real table recording who favourited what and when.
ALTER TABLE "galleries" DROP COLUMN "likes";
