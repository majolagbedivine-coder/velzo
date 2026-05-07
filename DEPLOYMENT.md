# Velzo — Deployment Guide

Everything deploys to **Vercel** — the React frontend as a static site and the Express API as a serverless function, all under one domain.

---

## Architecture

```
velzo.vercel.app/           → React SPA (static)
velzo.vercel.app/api/*      → Express serverless function
```

---

## 1. Set up a PostgreSQL database

Vercel integrates directly with **Neon** (free tier, no credit card needed).

1. Go to [neon.tech](https://neon.tech) → Create a free account → New Project → name it `velzo`
2. Copy the **Connection string** — it looks like:
   `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`
3. Keep this handy — you'll paste it into Vercel in the next step

---

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project → Import Git Repository**
2. Select your `velzo` GitHub repo
3. Vercel reads `vercel.json` automatically — confirm:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (repo root)
   - **Build Command**: `pnpm --filter @workspace/velzo run build:vercel`
   - **Output Directory**: `artifacts/velzo/dist`
4. Under **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from step 1 |
| `SESSION_SECRET` | A long random string — use `openssl rand -hex 32` to generate one |

5. Click **Deploy**

---

## 3. Run database migrations

After the first deploy, run this once from your local machine (or Replit shell):

```bash
DATABASE_URL=<your-neon-connection-string> pnpm --filter @workspace/db run push
```

This creates all the tables in your production Neon database.

---

## How it works

- `/api/:path*` requests are routed to `api/index.ts`, a Vercel serverless function that runs the full Express app
- All other routes serve `artifacts/velzo/dist/index.html`, enabling client-side routing
- No `VITE_API_URL` env var is needed — the frontend and API share the same domain, so relative `/api/*` calls work automatically

---

## Environment variable reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon recommended) |
| `SESSION_SECRET` | Yes | Secret key for signing JWTs |
| `CORS_ORIGINS` | Optional | Extra allowed origins (not needed for same-domain) |

---

## Pushing updates

After making changes in Replit:

```bash
git add -A
git commit -m "your message"
git push origin main
```

Vercel auto-deploys on every push to `main`.
