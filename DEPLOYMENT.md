# Velzo — Deployment Guide

## Architecture

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend (`artifacts/velzo`) | **Vercel** | React SPA |
| API (`artifacts/api-server`) | **Railway** | Express API + PostgreSQL |

---

## 1. Push to GitHub

Open a terminal (Shell tab in Replit) and run:

```bash
# Replace with your GitHub repo URL
git remote add origin https://github.com/YOUR_USERNAME/velzo.git

git push -u origin main
```

> **Tip:** Create the repo at https://github.com/new first (leave it empty — no README).

---

## 2. Deploy the API to Railway

Railway is the best fit for the Express + PostgreSQL backend.

### Steps

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Select your `velzo` repository
3. Railway will auto-detect the `railway.toml` config
4. Add a **PostgreSQL** plugin to the project (Railway provisions it and injects `DATABASE_URL` automatically)
5. Set these environment variables in Railway → **Variables**:

| Variable | Value |
|----------|-------|
| `SESSION_SECRET` | A long random string (e.g. `openssl rand -hex 32`) |
| `CORS_ORIGINS` | Your Vercel frontend URL, e.g. `https://velzo.vercel.app` |
| `NODE_ENV` | `production` |

6. Railway will build and start with: `pnpm --filter @workspace/api-server run start`
7. Note your Railway API URL — you'll need it in step 3. It looks like `https://velzo-production-xxxx.railway.app`

### Run DB migrations on Railway

After first deploy, open a Railway shell or use the CLI:

```bash
DATABASE_URL=<your-railway-db-url> pnpm --filter @workspace/db run push
```

---

## 3. Deploy the Frontend to Vercel

### Steps

1. Go to [vercel.com](https://vercel.com) → **Add New Project → Import Git Repository**
2. Select your `velzo` repository
3. Vercel will detect `vercel.json` automatically. Confirm these settings:
   - **Root Directory**: `.` (repo root)
   - **Build Command**: `pnpm --filter @workspace/velzo run build:vercel`
   - **Output Directory**: `artifacts/velzo/dist`
4. Add this environment variable in Vercel → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway API URL, e.g. `https://velzo-production-xxxx.railway.app` |

5. Click **Deploy**

### How it works

- The `vercel.json` builds the React app with `vite.config.vercel.ts` (no Replit-specific env vars required)
- All `/*` routes rewrite to `index.html` so client-side routing works
- The frontend calls `VITE_API_URL` for all API requests

---

## 4. Connect frontend ↔ API (final step)

Once both are deployed:

1. Copy your Vercel frontend URL (e.g. `https://velzo.vercel.app`)
2. In Railway → Variables, update `CORS_ORIGINS` to that URL
3. Railway redeploys automatically

---

## Local development

No changes — everything continues to work as-is on Replit. The Replit proxy routes `/api/*` to the local API server, so `VITE_API_URL` is not needed locally.

---

## Environment variable reference

### API server (`artifacts/api-server/.env.example`)

```
PORT=8080
DATABASE_URL=postgresql://user:password@host:5432/velzo
SESSION_SECRET=your-super-secret-key
CORS_ORIGINS=https://velzo.vercel.app
```

### Frontend (`artifacts/velzo/.env.example`)

```
VITE_API_URL=https://your-api.railway.app
```
