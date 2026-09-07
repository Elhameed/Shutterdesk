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

## 2. Pooled for the app, direct for migrations

The schema splits the two connections, so both variables must be set wherever the API
runs or migrates:

```prisma
// server/prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")          // pooled — the running app
  directUrl = env("DIRECT_DATABASE_URL")   // unpooled — prisma migrate only
}
```

`DATABASE_URL` should be Neon's **pooled** endpoint (the host contains `-pooler`), taken
from the Neon console under *Connection Details → Pooled connection*. PgBouncer avoids
per-connection setup cost and keeps a small instance from exhausting Postgres connections.

`DIRECT_DATABASE_URL` is the same host **without** `-pooler`. Migrations serialise
themselves with a session-scoped advisory lock, and under transaction pooling consecutive
statements can land on different backends, so that lock can never be held — `migrate
deploy` then fails with `P1002`. Running migrations over the direct connection avoids it.

Where there is no pooler (local Postgres, CI) both variables take the same value. See
[DEPLOYMENT.md](DEPLOYMENT.md) step 0 for the Render/Neon setup and for how to clear an
advisory lock that has already leaked.

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
