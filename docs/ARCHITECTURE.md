# Shutterdesk — Architecture Guide

How the codebase is put together, how a request flows end to end, and where the
complexity actually lives. Written for working on the project locally.

- Setup & deploy specifics: [DEPLOYMENT.md](DEPLOYMENT.md) · [CLOUDINARY.md](CLOUDINARY.md) · [TESTING.md](TESTING.md) · [PERFORMANCE.md](PERFORMANCE.md)

---

## 1. The system in one picture

Two independently deployed halves that only talk over HTTP JSON:

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  Frontend (Vite SPA)        │         │  API (Express 5)             │
│  React 19 + TS + Tailwind 4 │         │  Prisma 6 → PostgreSQL       │
│                             │         │                              │
│  pages → features → services│  HTTPS  │  routes → services → prisma  │
│         ↓                   │ ──────► │         ↑                    │
│  axios apiClient            │  JSON   │  auth / cors / rate-limit    │
│  Bearer <JWT>               │         │                              │
└─────────────────────────────┘         └──────────────────────────────┘
         │                                          │
         │  direct signed upload                    │  signature only
         ▼                                          ▼
   ┌──────────────────────────────────────────────────────┐
   │  Cloudinary  (receipts, gallery photos, avatars)     │
   └──────────────────────────────────────────────────────┘
```

There is **no server-side rendering and no BFF**. The SPA is static files; every
dynamic thing is an `/api/*` call. The API secret for Cloudinary never reaches the
browser — the browser asks the API to *sign* an upload, then uploads directly.

**Scale:** ~34k lines frontend (≈350 files), ~14k lines server (≈120 files), 92 route
handlers across 19 modules, 13 Prisma models.

---

## 2. Running locally from scratch

The working tree currently has **no `node_modules` and no `.env` files** — they are
gitignored. Full cold start:

```bash
# 1. Dependencies (two separate package.json files)
npm install
npm install --prefix server

# 2. Environment
cp .env.example .env                  # VITE_API_URL=http://localhost:5000/api
cp server/.env.example server/.env    # fill DATABASE_URL + JWT_SECRET

# 3. Database schema
npm run --prefix server db:migrate    # or: npx prisma migrate deploy
npm run db:seed                       # optional demo data

# 4. Run both halves
npm run dev:all                       # frontend :5173 + API :5000
```

**The two variables that must be right or nothing works:**

| Variable | Where | Note |
|---|---|---|
| `DATABASE_URL` | `server/.env` | Any Postgres. Local Postgres is *much* faster than remote Neon — see [PERFORMANCE.md](PERFORMANCE.md). |
| `JWT_SECRET` | `server/.env` | **Must be ≥32 chars** or the server refuses to boot (Zod-validated in `config/env.ts`). |

`CORS_ORIGIN` defaults to `http://localhost:5173`, which is what Vite serves — fine
as-is locally. Cloudinary vars are optional; leave them blank until you need uploads.

Health check: `curl http://localhost:5000/api/health` → `{"status":"ok","database":"connected"}`.

Steps 1 and the two builds are **verified working on Node 22 / npm 10** as of this writing
(259 frontend + 359 server packages, `npm run build` and `npm run build --prefix server`
both clean). Note `prisma generate` does *not* need a reachable database, so the server
compiles before you've configured `DATABASE_URL` — the failure surfaces at boot instead.

**Kill switch to know about:** [`src/constants/site-access.ts`](../src/constants/site-access.ts)
exports `SITE_PUBLICLY_ACCESSIBLE`. When `false`, the router discards every real route
and serves a maintenance page instead. Currently `true`. If the app renders one blank
placeholder page, check this first.

---

## 3. Repo map

```
src/                      Frontend
├─ app/                   App shell: providers, router, AuthProvider
├─ routes/                Route table, lazy page imports, route guards
├─ pages/                 Thin — almost every page just renders a feature View
├─ features/<domain>/     The actual UI, one folder per screen-domain
│  ├─ components/         View + its parts
│  ├─ lib/ utils/         Feature-local logic
│  └─ index.ts            Public barrel
├─ components/            Shared: ui/ (primitives), layout/, common/, skeletons/
├─ services/              API layer — the ONLY place axios is called
│  ├─ photographer/http/  One file per API module
│  ├─ client/http/
│  └─ *-mapper.ts         API shape → domain shape
├─ hooks/queries/         TanStack Query hooks (partial coverage — see §9)
├─ lib/                   apiClient, query config, currency, media URLs, downloads
├─ constants/             34 files — route paths + all UI copy
└─ types/domains/         Domain types shared across features

server/
├─ src/
│  ├─ app.ts              Middleware + mounts all 19 routers
│  ├─ index.ts            Boot, listen, graceful shutdown
│  ├─ config/env.ts       Zod-validated env (throws on bad config)
│  ├─ middleware/         auth, cors, error-handler, rate-limit, request-logger
│  ├─ modules/<domain>/   *.routes.ts (HTTP+validation) → *.service.ts (logic)
│  │                      → *.mapper.ts (DB row → API shape)
│  └─ lib/                Cross-module domain logic — the real brain (see §7)
├─ prisma/                schema.prisma + 12 migrations + seeds
└─ tests/                 Vitest + Supertest integration tests
```

**The naming convention that makes navigation easy:** a frontend feature folder,
a server module, and a route path all share a name. `photographer-galleries` (feature)
↔ `/photographer/galleries` (route) ↔ `modules/galleries/photographer-galleries.routes.ts`.
Follow that thread and you can find anything.

---

## 4. Frontend architecture

### Layering

```
route (routes/index.tsx)
  → page (pages/…)            thin wrapper, no logic
    → View (features/…/View)  state, data fetching, composition
      → components            presentational
        → services (…Api)     axios call + mapper
          → lib/api-client    interceptors: attach JWT, handle 401
```

The rule the codebase holds to well: **`apiClient` is never imported outside
`src/services/` and `src/lib/`.** Components go through the `photographerApi` /
`clientApi` façades. Verified — zero violations.

### The two API façades

[`services/photographer/index.ts`](../src/services/photographer/index.ts) and
[`services/client/index.ts`](../src/services/client/index.ts) each assemble one object
from per-domain HTTP modules:

```ts
photographerApi.bookings.list()
photographerApi.galleries.uploadPhotos(id, keys)
clientApi.payments.uploadReceipt({ … })
```

Each HTTP module does the axios call and immediately runs a **mapper** — API responses
carry `*AssetKey` fields, and mappers resolve those into real URLs via `assetUrl()` /
`resolveMediaUrl()`, plus fill defaults. So components receive display-ready domain
objects, never raw API shapes. That indirection is the reason images work identically
for bundled local assets and Cloudinary URLs.

### App shell

Provider nesting in [`app/providers.tsx`](../src/app/providers.tsx) — order matters:

```
QueryClientProvider → BrowserRouter → ToastProvider → ErrorBoundary
  → AuthProvider → NotificationToastBridge → routes
```

`AuthProvider` sits *inside* the router because guards call `useAuth()` during render.

### Auth on the client

- JWT + role persisted in `localStorage` (`shutterdesk_token`, `shutterdesk_role`, `shutterdesk_remember`).
- On mount, `AuthProvider` calls `GET /auth/me` to rehydrate; failure clears the session.
- Request interceptor attaches `Authorization: Bearer …`.
- Response interceptor: **any 401 outside login/register wipes the session and hard-redirects to `/login`** via `window.location.assign` — a full page reload, not a soft navigate.

### Route guards

[`ProtectedRoute`](../src/routes/ProtectedRoute.tsx) enforces three gates in order:

1. Not authenticated → `/login`
2. `user.needsOnboarding` and not already on `/onboarding/*` → onboarding profile route
3. Wrong role for this route → that user's own dashboard

`GuestRoute` is the inverse for `/login` and `/register`. All pages are `React.lazy`
via [`routes/lazy-pages.ts`](../src/routes/lazy-pages.ts), wrapped in one `<Suspense>`.

---

## 5. Backend architecture

### Request lifecycle

```
helmet → cors → express.json (1mb) → requestLogger
  → router (per module)
      → rate limiter (auth/upload/write routes)
      → createAuthMiddleware   verify JWT + load user + check tokenVersion
      → requireRole("photographer" | "client")
      → Zod safeParse on req.body        ── fails → AppError 400 + field errors
      → service function                  ── business logic + prisma
      → mapper → res.json({ data })
  → 404 catch-all
  → errorHandler
```

### Consistent conventions worth preserving

- **Every router is a factory:** `createXRouter(env)`. Env is injected, never read from
  `process.env` inside modules. Makes tests trivial.
- **Response envelope:** success is `{ data: … }` (or `{ user, token }` for auth).
  Errors are `{ message, statusCode, errors? }` from `AppError`.
- **Routes validate, services decide, mappers format.** Routes contain no business logic.
- **Studio scoping is the security boundary.** `Studio.ownerUserId` is unique;
  [`getStudioForPhotographer(userId)`](../server/src/lib/studio-context.ts) resolves it,
  and every photographer query filters by that `studioId`. This is what stops photographer
  A reading photographer B's data — so any new photographer query **must** go through it.

### Auth on the server

JWT payload is `{ userId, email, role, tokenVersion }`, HS256. The `tokenVersion` column
on `User` is the revocation mechanism: logout increments it, and the middleware rejects
tokens whose version doesn't match. `loadAuthUser` also refuses deactivated accounts.

Note the middleware hits the database on **every authenticated request** to check
`tokenVersion` and deactivation.

---

## 6. Data model

13 models. The spine:

```
User (photographer|client)
 └─ Studio (1:1, ownerUserId)               ← tenant root for photographers
     ├─ StudioSchedule (1:1)  + AvailabilityBlock[]
     ├─ ServicePackage[]                     packages with price + depositPercent
     ├─ StudioClient[]                       CRM record (may link to a User)
     ├─ Booking[]  ────┬─ PaymentRequest[]   deposit | balance | full
     │                 ├─ PaymentVerification[]  uploaded receipt awaiting review
     │                 ├─ PaymentRecord[]        approved payment ledger
     │                 └─ Gallery? (1:1)
     └─ Gallery[] ── GalleryPhoto[]
Notification → User
```

**Two ideas that explain most of the schema:**

1. **`StudioClient` vs `User`.** A photographer can add a client who has no account
   (`StudioClient` with `linkedUserId = null`). If that person later registers, the
   records link up. So client identity is matched by **email** in several places —
   `Booking` carries both `clientId`, `clientUserId`, *and* a denormalized `clientEmail`.

2. **Heavy denormalization.** Bookings and galleries copy their context inline
   (`clientName`, `packageName`, `packagePrice`, `sessionDateLabel`, `sessionTime`) rather
   than joining. Plus a lot of `Json` columns: `Booking.timeline/paymentMeta/clientMeta`,
   `Gallery.settings/delivery/analytics/activities`, `StudioClient.preferences/insights/
   timeline/projects/invoices/galleries`, and six `Json` settings blobs on `Studio`.
   This keeps reads to one query and lets the UI shape change without migrations — but
   those columns are **untyped and unvalidated at the DB layer**, and it's the single
   biggest source of complexity here (see §9).

Money is stored as **integer RWF** (no decimals) throughout. Migrations are SQL files
under `server/prisma/migrations/` — apply with `prisma migrate deploy`.

---

## 7. The three core domain flows

Most of the app's real logic is in `server/src/lib/`, shared across modules. These are
the flows worth understanding before changing anything.

### A. Booking lifecycle

[`lib/booking-lifecycle.ts`](../server/src/lib/booking-lifecycle.ts) derives a **stage**
from booking fields rather than storing it:

```
awaiting_deposit → awaiting_verification → confirmed → session_scheduled
  → session_completed → awaiting_balance → gallery_delivery      (or → cancelled)
```

`resolveLifecycleStage()` is the single source of truth. The same file also computes the
**primary action button** for each audience (`resolveClientPrimaryAction` /
`resolvePhotographerPrimaryAction`) and the status message. So the client's "Pay deposit"
button and the photographer's "Review payment" button come from one shared derivation —
change the state machine here, both UIs follow.

Guard rails encoded here: a booking can only be cancelled or manually confirmed **while
pending with no money and no receipt in play** (`isBookingProtectedByDeposit`).

### B. Payment verification (manual, by design)

There is no payment gateway. Rwanda MoMo / bank transfer means a **human-verified receipt
loop**:

```
1. Client uploads receipt image  →  signed direct upload to Cloudinary
2. POST /client/payments/receipts →  PaymentVerification (status: pending)
                                     booking.showVerifyPayment = true
3. Photographer sees it in the verification queue
4. PATCH /photographer/payments/verifications/:id  { approved | rejected }
```

Approval is one `prisma.$transaction` ([payments.service.ts:327](../server/src/modules/payments/payments.service.ts))
that atomically:

- marks the verification `approved`, the `PaymentRequest` `approved`
- increments `booking.amountPaid` (capped at `packagePrice`), sets `paymentStatus` to `partial`/`paid`
- **auto-confirms the booking** if the payment was a `deposit` or `full` and the booking was `pending`
- writes a `PaymentRecord` ledger row
- then (outside the transaction) sends the client notifications

Rejection reverses the `PaymentRequest` to `unpaid` so the client can resubmit.

### C. Gallery delivery gate

[`lib/gallery-release.ts`](../server/src/lib/gallery-release.ts) enforces the commercial
rule: **a gallery cannot be released while the package balance is outstanding.**
`assertGalleryReleaseAllowed()` throws a 409 naming the remaining amount.

The escape hatch is `paymentMeta.galleryReleaseOverride` — set via
`PATCH /photographer/bookings/:id/gallery-release-override`, letting a photographer
deliver early. Client-side galleries can additionally be **PIN-protected**
(`POST /client/galleries/:id/verify-pin`), with access cached in
[`lib/gallery-access-session.ts`](../src/lib/gallery-access-session.ts).

---

## 8. Cross-cutting concerns

**Uploads.** Browser → `POST /{role}/uploads/sign` → API returns a Cloudinary signature
scoped to a context (`receipts`, `galleries`, `avatars`, `services`) → browser POSTs the
file straight to Cloudinary → the resulting `secure_url` is sent back to the API. Contexts
are role-restricted server-side: clients may only use `receipts`/`avatars`. The API never
proxies file bytes.

**Notifications.** Server writes `Notification` rows via
[`lib/notification-dispatch.ts`](../server/src/lib/notification-dispatch.ts). The client
polls with TanStack Query; [`NotificationToastBridge`](../src/components/common/NotificationToastBridge.tsx)
turns newly-arrived ones into toasts and the sidebar shows an unread badge. There are no
websockets and no email delivery.

**Errors.** Server: throw `AppError(message, status, fieldErrors?)`; the handler also maps
Prisma `P2002` → 409 and `P2025` → 404, and reports anything unexpected to Sentry as a
generic 500. Client: `getApiErrorMessage` / `getQueryErrorMessage` unwrap the envelope
into user-facing text.

**Loading UX.** [`useDelayedLoading`](../src/hooks/useDelayedLoading.ts) waits 150 ms
before showing a skeleton and then holds it ≥400 ms, so fast loads never flash. Views
follow: `showSkeleton → <Skeleton/>`, `isLoading → null`, `error → message`, else content.

**Rate limits.** 15-minute windows: auth 30, uploads 60, writes 120. Skipped when
`NODE_ENV=test`.

---

## 9. Complexity hotspots — where simplification pays off

Observations from reading the code, roughly highest-value first. These are candidates,
not prescriptions.

**1. Two competing data-fetching patterns.** Only **14 files** use the TanStack Query
hooks in `hooks/queries/`; **33 files** call `photographerApi`/`clientApi` directly inside
`useEffect` + `useState`, hand-rolling loading/error state each time. That's the largest
source of repetition in the frontend, and it means most screens get no caching,
deduplication, or refetch-on-focus despite the library being installed and configured.
Consolidating on Query hooks would delete a lot of code. Relatedly, `lib/query-keys.ts`
only defines keys for 8 of the queries that exist.

**2. `Json` columns doing schema's job.** ~15 untyped `Json` columns across `Booking`,
`Gallery`, `StudioClient`, and `Studio`. `StudioClient` alone carries `preferences`,
`insights`, `timeline`, `projects`, `invoices`, and `galleries` as JSON — several of which
duplicate data that already exists relationally in `Booking`/`Gallery`/`PaymentRecord`.
Promoting the ones that are really relational into columns or tables would remove whole
categories of sync bugs; the settings blobs on `Studio` are a more reasonable use.

**3. Denormalized booking fields need manual syncing.** `Booking` stores `clientName`,
`clientEmail`, `packageName`, `packagePrice`, `sessionDateLabel`, `sessionTime`,
`clientAvatarAssetKey` inline. That's why `lib/` contains `client-profile-sync.ts`,
`photographer-identity-sync.ts`, and `sync-booking-gallery-progress.ts` — files that exist
purely to keep copies consistent. Fewer copies means fewer sync files.

**4. Very large service files.** `bookings.service.ts` (1186 lines) and
`galleries.service.ts` (1049) hold ~16 exported functions each mixing photographer and
client concerns in one file. Splitting along the photographer/client seam that already
exists in the routes would match the rest of the codebase's structure.

**5. Constants sprawl.** 34 files / 2,740 lines in `src/constants/`, mostly UI copy
extracted into per-page objects (`PHOTOGRAPHER_DASHBOARD_COPY` etc.). It's consistent, but
it means every text change is a two-file edit and the indirection is not buying i18n or
reuse today. Worth deciding deliberately whether to keep.

**6. Small duplication to clean up.**
- Two `SearchField` components — [`components/common/SearchField.tsx`](../src/components/common/SearchField.tsx) (38 lines, 3 importers) and [`components/photographer/SearchField.tsx`](../src/components/photographer/SearchField.tsx) (a 1-line re-export, 1 importer) — *plus* five per-feature `*Search.tsx` wrappers.
- `src/mocks/personas.ts` is production-imported by `constants/landing.ts` for testimonials; it reads as leftover scaffolding.
- README links to `docs/PROJECT_STRUCTURE.md`, **which does not exist** (this file replaces it — update the link).

**7. Per-request DB round trip for auth.** Every authenticated request loads the user to
check `tokenVersion`. Correct, but on a remote database it adds a round trip to all 92
endpoints — relevant given the latency notes in [PERFORMANCE.md](PERFORMANCE.md).

**8. Two deprecations to clear while you're rebuilding.**
- Prisma warns that `package.json#prisma` (the `seed` config) is **removed in Prisma 7** — migrate to a `prisma.config.ts`. You're on 6.19.
- The main frontend chunk is **498 kB (150 kB gzipped)** despite every page being lazy-loaded, so the weight is in shared vendor code, not routes. Worth a look if bundle size matters.

---

## 10. Testing

| Layer | Tool | Location | Command |
|---|---|---|---|
| Server unit + integration | Vitest + Supertest | `server/tests/` (24 files) | `npm run test:api` |
| End-to-end | Playwright | `e2e/` (2 specs) | `npm run test:e2e` |
| Lint | ESLint 9 flat config | both halves | `npm run lint` |
| Types + build | `tsc -b && vite build` | — | `npm run build` |

The API suite **runs against a real Postgres database and creates/deletes real rows**. It
loads `server/.env.test` with `override: true` and **refuses to run** if that file is
missing outside CI — a deliberate guard against pointing the destructive suite at your dev
database. Create it before first run: `cp server/.env.test.example server/.env.test`.
Tests run serially (`fileParallelism: false`) because they share the database.

Playwright boots both dev servers itself via `webServer` and waits on `/api/health`.

CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) runs three sequential jobs —
build → api-tests → e2e — with a `postgres:16` service container.

---

## 11. Deployment as it stands

Vercel (static SPA, SPA rewrite in `vercel.json`) · Render (API, `render.yaml` blueprint,
Frankfurt, `rootDir: server`, `start:prod` runs `prisma migrate deploy` first) · Neon
(Postgres). If you're rebuilding this, the two coupling points that always break first are
`VITE_API_URL` (baked in at **build** time, so changing it needs a redeploy) and
`CORS_ORIGIN` on the API, which supports comma-separated origins and single-label `*`
wildcards for Vercel previews.
