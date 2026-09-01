# Shutterdesk — Database Response Time

The API's per-request latency is dominated by round trips to Postgres. During testing,
requests against the remote Neon database took **~3–7s each**. Almost all of that is
**not** application code — it is network + database overhead. Here is where it comes from
and how to cut it, in order of impact.

## 1. Co-locate the API and the database region (biggest lever)

Every query is a round trip. If the API (Render) and the database (Neon) are in different
regions, each query pays cross-region latency, and a single request often runs several
queries in sequence.

- Neon here is in `eu-central-1` (Frankfurt).
- **Make the Render service region match** (Frankfurt / EU). Same-region DB round trips are
  typically ~1–5 ms vs. 100–300 ms across regions.
- Check: Render dashboard → service → *Region*. Neon console → project → *Region*.

## 2. Use Neon's pooled connection endpoint

The current `DATABASE_URL` uses Neon's **direct** endpoint (`ep-...neon.tech`). For a
serverless Postgres, use the **pooled** endpoint (PgBouncer) for the app runtime — it
avoids per-connection setup cost:

```
# runtime (app) — pooled endpoint, note the "-pooler" in the host
DATABASE_URL="postgresql://USER:PASSWORD@ep-YOUR-ENDPOINT-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
```

Grab the pooled string from the Neon console (*Connection Details → Pooled connection*).

### Optional: split runtime vs. migration URLs

PgBouncer (pooled) doesn't support the statements Prisma Migrate needs, so keep a direct
URL for migrations. Prisma supports this with `directUrl`:

```prisma
// server/prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled — used by the running app
  directUrl = env("DIRECT_URL")     // direct  — used by prisma migrate/introspect
}
```

Then set both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in the environment.
⚠️ If you add `directUrl`, `DIRECT_URL` becomes **required** for `prisma migrate` — set it
everywhere migrations run (local, CI, Render build), or migrations will fail. This change is
documented but not applied by default to avoid breaking existing setups.

## 3. Neon autosuspend cold starts (the 3–7s spikes)

Neon's free/lower tiers **scale the compute to zero** after inactivity. The first query after
idle pays a cold start (~0.5–3 s), which is what produces the occasional multi-second spike.

- Paid Neon plans let you **disable scale-to-zero** or raise the autosuspend timeout.
- Cheap mitigation: a small **keep-warm** ping (e.g. an external uptime monitor hitting
  `/api/health` every few minutes) keeps the compute active during working hours.

## 4. Local development should use a local Postgres

If you develop from a location far from the DB region, every query in dev crosses the ocean.
Point local dev at a **local Postgres** (Docker or native) — round trips drop to sub-ms:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shutterdesk?schema=public"
```

Run migrations against it (`npx prisma migrate deploy`) and optionally `npm run db:seed`.
The test suite already uses an isolated DB via `server/.env.test` (see `docs/TESTING.md`) —
a local Postgres there is the fastest option.

## 5. Application-level (already in place, keep it up)

- **Single PrismaClient** — reused across reloads/tests (`server/src/lib/prisma.ts`) so the
  connection pool stays warm instead of being rebuilt on every hot reload.
- **Fewer round trips** — batch reads with Prisma `include`/`select` and wrap multi-write
  flows in `prisma.$transaction([...])` (the payment/booking hot paths already do this)
  rather than issuing sequential `await` queries.
- Note: password hashing (`bcrypt`, cost 12) adds ~250–400 ms to **register/login only** —
  this is intentional for security and unrelated to read latency.

## Quick wins checklist

- [ ] Render service in the same region as Neon (§1)
- [ ] `DATABASE_URL` uses the `-pooler` host (§2)
- [ ] Keep-warm ping on `/api/health`, or disable Neon scale-to-zero (§3)
- [ ] Local Postgres for local dev + tests (§4)
