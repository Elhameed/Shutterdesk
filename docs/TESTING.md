# Shutterdesk — Testing

## API integration tests (Vitest + Supertest)

Located in `server/tests/`. They run against a real PostgreSQL database using Prisma migrations. **The suite creates and deletes real records**, so it must run against a database that is _not_ your dev/prod database.

### Prerequisites — isolated test database (required)

Tests load `server/.env.test` (with override) via `vitest.config.ts`, so they never touch `server/.env`. Create it once:

```bash
cp server/.env.test.example server/.env.test
# then set DATABASE_URL to a local Postgres or a dedicated Neon test branch
```

- `DATABASE_URL` — a **dedicated** database (local Postgres, or a Neon *test branch*). A local Postgres is strongly recommended for speed (sub-ms round trips vs. seconds to a remote cloud DB).
- `JWT_SECRET` — any value ≥ 32 characters.

As a safety net, the suite **refuses to run** if `server/.env.test` is missing and `CI` is not set — this prevents accidentally running the destructive suite against the database in `server/.env`.

In CI, `.env.test` is absent; set `CI=1` and provide `DATABASE_URL` via the environment (the GitHub Actions Postgres service already does this).

### Run

```bash
# From repo root
npm run test:api

# Or from server/
cd server
npm test
npm run test:watch
```

### What is covered

| Suite | Focus |
|-------|--------|
| `auth.test.ts` | Health, register, login, `/auth/me`, role |
| `bookings.test.ts` | Photographer deposit `%`, client marketplace booking |
| `payments.test.ts` | Receipt upload + photographer verification queue |

PowerShell smoke scripts remain available: `npm run verify:api`, `npm run verify:fresh`.

---

## E2E tests (Playwright)

Located in `e2e/`. Playwright starts the API and Vite dev servers automatically (unless already running locally).

### Prerequisites

- Seeded demo data for golden-path tests:

```bash
cd server
npx prisma migrate deploy
npm run db:seed
```

Demo client: `immaculee.niyonsaba@gmail.com` / `password123`

### Run

```bash
# Seed demo users (required once per database)
npm run db:seed

# Option A — let Playwright start API + Vite (stop any running dev servers first)
npx playwright install chromium
npm run test:e2e

# Option B — reuse an existing stack
npm run dev:all
# then in another terminal:
npm run test:e2e

# Interactive UI
npm run test:e2e:ui
```

### Golden path

`e2e/client-portal.spec.ts` follows the checklist in `docs/CLIENT_API.md`:

1. Log in as demo client → dashboard
2. Navigate bookings, payments, galleries, notifications
3. Open book-session marketplace

Receipt upload is covered by API tests (Cloudinary not required in CI).

---

## TanStack Query

List and dashboard screens use React Query hooks in `src/hooks/queries/`:

| Hook | Screen |
|------|--------|
| `usePhotographerDashboard` | Photographer dashboard, sidebar |
| `usePhotographerBookings` | Photographer bookings list |
| `usePhotographerGalleries` | Photographer galleries list |
| `useClientDashboard` | Client dashboard |
| `useClientBookings` | Client bookings list |
| `useClientGalleries` | Client galleries list |

After mutations (e.g. creating a booking), invalidate with `queryClient.invalidateQueries({ queryKey: queryKeys... })`.

---

## CI

GitHub Actions runs:

1. **build** — lint + frontend/server build
2. **api-tests** — Postgres service + `npm test` in `server/`
3. **e2e** — migrate + seed + Playwright (Chromium)
