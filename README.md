# Shutterdesk

**Photography studio management and client delivery platform** — built for photographers in
Rwanda and beyond to manage bookings, clients, galleries, payments, and studio settings in
one place.

**[Live demo →](https://shutterdesk.vercel.app/)**

[![CI](https://github.com/Elhameed/Shutterdesk/actions/workflows/ci.yml/badge.svg)](https://github.com/Elhameed/Shutterdesk/actions/workflows/ci.yml)

---

## Screenshots

| Landing | Photographer dashboard |
|---------|------------------------|
| ![Landing page](docs/design/screenshots/01-landing.png) | ![Photographer dashboard](docs/design/screenshots/03-dashboard.png) |

| Bookings | Gallery detail |
|----------|----------------|
| ![Bookings](docs/design/screenshots/04-bookings.png) | ![Gallery detail](docs/design/screenshots/05-gallery-detail.png) |

---

## The problem

A working photographer runs their business across a phone gallery, a spreadsheet, and a
messaging app. Bookings get double-booked, deposits go unverified, and delivering a shoot
means uploading a folder somewhere and hoping the client finds it. Shutterdesk puts the
whole job — enquiry through to delivered gallery — behind one login, with a matching
client-facing portal so the photographer stops being the middleman for status updates.

Mobile money is how clients actually pay in Rwanda, and MoMo has no card-style webhook. So
payment here is **receipt verification**: the client uploads a payment slip, the
photographer approves or rejects it, and the booking's payment state moves accordingly.

## What it does

**For the photographer**

- **Dashboard** — upcoming shoots, revenue, and recent activity at a glance
- **Calendar & bookings** — month view, availability rules that prevent double-booking,
  session lifecycle from request to completion
- **Clients** — profiles, booking history, and per-client payment standing
- **Services** — packages with pricing and deposit rules
- **Galleries** — create, upload, deliver, PIN-protect, and track downloads
- **Payments** — a verification queue for MoMo and bank receipts
- **Analytics, notifications, settings** — revenue reporting, alerts, studio branding

**For the client** — a separate portal to view bookings, pay deposits by uploading a
receipt, and open and download delivered galleries.

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, TanStack Query v5, Axios |
| Backend | Express 5, Prisma 6, PostgreSQL, JWT auth, Zod validation |
| Media | Cloudinary, uploaded direct from the browser with server-signed parameters |
| Testing | Vitest + Supertest (API integration), Playwright (end-to-end) |
| CI/CD | GitHub Actions · Vercel (frontend) · Render (API) · Neon (database) |

## How it fits together

Two independently deployed halves that talk only over HTTP JSON — a static SPA on Vercel
and an Express API on Render. There is no server-side rendering and no BFF.

```
Browser ──► Vercel (static SPA)  ──HTTPS/JSON──►  Render (Express API)  ──►  Neon Postgres
   │                                                      │
   └────────── direct signed upload ──► Cloudinary ◄───────┘ (signature only)
```

The Cloudinary API secret never reaches the browser: the client asks the API to *sign* an
upload, then uploads the file directly. On the server, each module is
`routes → service → mapper`, with tenancy enforced at a single boundary
(`getStudioForPhotographer`) rather than re-checked per query. On the client, `src/services/`
is the only place axios is called, and every view fetches through TanStack Query hooks.

[**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) covers the request path, the data model,
the three core domain flows, and the design trade-offs in detail.

---

## Getting started

### Prerequisites

- Node.js 20 LTS or newer
- npm 9+
- A PostgreSQL database — local Postgres, or a free [Neon](https://neon.tech) project

### 1. Clone and install

```bash
git clone https://github.com/Elhameed/Shutterdesk.git
cd Shutterdesk
npm install
cd server && npm install && cd ..
```

Install the server from inside `server/`. Running `npm install --prefix server` from the
root makes npm link the root package into `server/node_modules` as a stray dependency.

### 2. Configure environment variables

```bash
cp .env.example .env
cp server/.env.example server/.env
```

**`.env`** (frontend)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://localhost:5000/api` |

**`server/.env`** (backend)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_DATABASE_URL` | Unpooled connection for migrations — same value as `DATABASE_URL` unless you use a pooler |
| `JWT_SECRET` | Any string, 32+ characters — the server refuses to boot below that |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `CLOUDINARY_*` | Only needed for receipt & gallery uploads — see [docs/CLOUDINARY.md](docs/CLOUDINARY.md) |

### 3. Set up the database

```bash
cd server
npx prisma migrate deploy
npm run db:seed     # optional: demo studio, clients, bookings, galleries
cd ..
```

### 4. Run the app

```bash
npm run dev:all     # frontend on :5173, API on :5000
```

Open **http://localhost:5173**.

---

## Testing

```bash
npm run test:api    # Vitest + Supertest against a real Postgres
npm run test:e2e    # Playwright, boots both dev servers itself
```

The API suite creates and deletes real rows, so it **refuses to run** without
`server/.env.test` pointing at a throwaway database — a deliberate guard against aiming it
at your development data. Create it first:

```bash
cp server/.env.test.example server/.env.test
```

See [docs/TESTING.md](docs/TESTING.md) for the disposable Postgres container and the full
harness.

## Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start frontend + API together |
| `npm run build` | Type-check and build the frontend for production |
| `npm run lint` | ESLint across both halves |
| `npm run db:seed` | Seed demo data |
| `npm run test:api` | API integration tests |
| `npm run test:e2e` | Playwright end-to-end tests |

Scripts under `scripts/` (`db:reset:clean`, `verify:api`, `verify:fresh`) are PowerShell and
run on Windows. The cross-platform equivalent of the reset is
`npm run db:reset:clean --prefix server`.

## Documentation

| Document | Contents |
|------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Request path, repo map, data model, core flows, design trade-offs |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploying to Vercel + Render + Neon, and troubleshooting |
| [docs/TESTING.md](docs/TESTING.md) | Test harness, disposable database, writing new tests |
| [docs/CLOUDINARY.md](docs/CLOUDINARY.md) | Signed upload setup for receipts, galleries, and avatars |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | Database latency: pooling, region co-location, cold starts |
