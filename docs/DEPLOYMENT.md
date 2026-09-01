# Shutterdesk — Production Deployment (Vercel + Render)

Deploy the **React frontend** on Vercel and the **Node.js API** on Render, with **Neon PostgreSQL** as the database (already used locally).

---

## Architecture

```
Browser
   │
   ├─► Vercel (static SPA, dist/)
   │      VITE_API_URL ──────────────────┐
   │                                    │
   └─► Render Web Service (server/)     │
          Express API on /api/*  ◄──────┘
                 │
                 ▼
          Neon PostgreSQL
```

---

## Prerequisites

- GitHub repo pushed to `main`
- [Neon](https://neon.tech) project with a **pooled** `DATABASE_URL`
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account

Generate a production JWT secret (32+ characters):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 1 — Deploy API on Render

### Option A: Blueprint (`render.yaml`)

1. In Render Dashboard → **New** → **Blueprint**
2. Connect the Shutterdesk GitHub repo
3. Render reads [`render.yaml`](../render.yaml) and creates `shutterdesk-api`

### Option B: Manual Web Service

| Setting | Value |
|---------|--------|
| **Root directory** | `server` |
| **Runtime** | Node |
| **Build command** | `npm install --include=dev && npm run build` |
| **Start command** | `npm run start:prod` |
| **Health check path** | `/api/health` |

### Render environment variables

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon pooled connection string (`?sslmode=require`) |
| `JWT_SECRET` | Your generated secret (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your Vercel URL(s), comma-separated — see below |
| `CLOUDINARY_CLOUD_NAME` | From [Cloudinary dashboard](https://cloudinary.com/console) — **required for uploads** |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER_PREFIX` | `shutterdesk` (default) |
| `SENTRY_DSN` | Optional — forwards errors to Sentry when set |

See [CLOUDINARY.md](./CLOUDINARY.md) for upload setup. Without Cloudinary, receipt and gallery uploads will fail in production.

**CORS_ORIGIN examples:**

```text
# Production only
https://shutterdesk.vercel.app

# Production + local dev
https://shutterdesk.vercel.app,http://localhost:5173

# Production + all Vercel preview deploys (wildcard not supported — list previews or use a single production URL)
https://shutterdesk.vercel.app,https://shutterdesk-git-main-yourteam.vercel.app
```

> Render assigns a URL like `https://shutterdesk-api.onrender.com`. Note this for the frontend step.

### Post-deploy checks

```bash
curl https://YOUR-RENDER-URL.onrender.com/api/health
```

Expected: `{"status":"ok","database":"connected",...}`

### Optional: seed demo data on staging

From your machine (with production `DATABASE_URL` in env):

```bash
cd server
DATABASE_URL="your-neon-url" npm run db:seed
```

---

## Step 2 — Deploy frontend on Vercel

1. Vercel Dashboard → **Add New Project** → import Shutterdesk repo
2. Framework preset: **Vite**
3. **Root directory:** `.` (repo root)
4. **Build command:** `npm run build`
5. **Output directory:** `dist`

### Vercel environment variables

| Variable | Environment | Value |
|----------|-------------|--------|
| `VITE_API_URL` | Production | `https://YOUR-RENDER-URL.onrender.com/api` |
| `VITE_API_URL` | Preview | Same as production (or a staging API URL) |

> `VITE_*` variables are baked in at **build time**. Redeploy after changing them.

[`vercel.json`](../vercel.json) configures SPA routing so React Router paths work on refresh.

---

## Step 3 — Wire CORS

After you know the Vercel URL:

1. Render → `shutterdesk-api` → **Environment**
2. Set `CORS_ORIGIN` to your Vercel production URL
3. **Save** — Render redeploys automatically

If the frontend shows CORS errors in the browser console, the origin is missing from `CORS_ORIGIN`.

---

## Step 4 — Smoke test production

1. Open your Vercel URL
2. Register a new photographer → complete onboarding → create a service package
3. Register a client (incognito) → book a session
4. Confirm API health and login work

---

## Local development (unchanged)

```bash
npm run dev:all
```

| File | Purpose |
|------|---------|
| `.env` | `VITE_API_URL=http://localhost:5000/api` |
| `server/.env` | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=http://localhost:5173` |

---

## CI

GitHub Actions ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs on push/PR:

- ESLint
- Frontend production build
- Server TypeScript build

---

## Phase 8 checklist (remaining optional items)

| Item | Status |
|------|--------|
| Vercel frontend deploy | Ready — follow steps above |
| Render API deploy | Ready — `render.yaml` + `start:prod` |
| Neon Postgres | Use existing project |
| CORS multi-origin | Implemented |
| Auth rate limiting | Implemented (30 req / 15 min) |
| Helmet security headers | Implemented |
| GitHub Actions CI | Implemented |
| Sentry monitoring | Not yet — add when needed |
| Swagger `/api/docs` | Not yet |
| Custom domain (`app.shutterdesk.rw`) | Vercel + Render dashboard when ready |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Loading dashboard…` forever | API unreachable or CORS blocked — check `VITE_API_URL` and `CORS_ORIGIN` |
| `Invalid environment configuration` on Render | Set `DATABASE_URL` and `JWT_SECRET` (32+ chars) |
| Migrations fail on deploy | Ensure `prisma` is in server `dependencies` and `start:prod` runs `migrate deploy` |
| Build fails with `Could not find a declaration file for module 'express'` | Set build command to `npm install --include=dev && npm run build` (NODE_ENV=production skips devDependencies by default) |
| 401 on all requests | Token from different `JWT_SECRET` — log out and log in again |
| Cold start delay (Render free) | First request after idle may take ~30s |
