# Deploy.com

Ship any public GitHub repository to Vercel from a URL like `deploy.com/owner/repo`. Branch, env vars, live logs, QR codes, and automatic 7-day cleanup included. Large repos are handled by a VM-backed worker that runs `git clone` + `vercel deploy --prod`.

## Features
- URL-based deploys for public GitHub repos
- Branch selection and env var injection
- Live logs and shareable status links
- Custom domains per deployment
- Auth-gated deploys (Google + email/password)
- Automatic cleanup after 7 days
- Worker queue for large repos

## Docs
- Website docs: `/docs`
- API docs: `docs/api.md`
- Worker docs: `docs/worker.md`
- Testing docs: `docs/testing.md`

## Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS + shadcn/ui + next-themes
- Vercel REST API v13 + GitHub REST API
- Vercel Postgres for deployment history
- Worker queue (Node + Vercel CLI)

## Quickstart
1. Install deps: `npm install`
2. Copy envs: `cp .env.local.example .env.local` and fill `GITHUB_TOKEN`, `VERCEL_TOKEN`, `POSTGRES_URL`.
3. Run dev: `npm run dev`
4. Visit `http://localhost:3000` and try `http://localhost:3000/vercel/next.js?branch=main&env=API_KEY=abc`.

## API
- `POST /api/deploy`  
  Body `{ owner, repo, branch?, envVars?: [{ key, value }] }`  
  Validates repo (public-only) and enqueues a deployment job. Rate limited to 5/min/IP.
- `GET /api/status/:id`  
  Returns `{ status, url, ready, logs }`. Job-backed deployments stream logs from the worker.
- `POST /api/cleanup`  
  Deletes expired (7d) deployments and cleans DB rows; schedule as cron.
- `GET /api/deployments`  
  Returns the most recent deployments for the signed-in user.

### Example
```bash
curl -X POST http://localhost:3000/api/deploy \
  -H "Content-Type: application/json" \
  -d '{"owner":"vercel","repo":"next.js","branch":"main","envVars":[{"key":"API_KEY","value":"abc"}]}'
```

## Database
- Schema lives in `db/migrations/001_init.sql`
- Seed sample rows in `db/seed.sql`
- Runtime table creation happens automatically via `lib/db.ts`

## Repo layout
- `app/` Next.js routes and pages
- `components/` shared UI components
- `lib/` server logic, API wrappers, DB helpers
- `docs/` project documentation
- `worker/` VM worker for large repos

## Testing
- Unit tests: `npm run test`
- Health check: `npm run healthcheck`
- Load test: `npm run loadtest`

## Deploy to Vercel (one command)
```bash
npm install && npm run build && vercel deploy --prebuilt --prod --env GITHUB_TOKEN --env VERCEL_TOKEN --env POSTGRES_URL
```
If envs already configured in the Vercel dashboard, run `vercel --prod` from the project root.

## Worker (for large repos)
Run the worker on a VM/container so large repos can be cloned and deployed without serverless limits.

```bash
node worker/worker.js
```

Required env vars:
- `POSTGRES_URL`
- `VERCEL_TOKEN`
- Optional: `DEPLOY_WORKER_POLL_MS=5000`
- Optional: `DEPLOY_USE_WORKER=false` (disable the queue and use direct deploys)

The API queues jobs into `deploy_jobs`, and the worker processes them, writing logs/status back to Postgres.

### Cron cleanup
Add a Vercel cron job hitting `/api/cleanup` daily to delete stale projects and rows.

## Contributing
See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.

## UX Notes
- Landing page auto-parses `github.com/user/repo` into `deploy.com/user/repo`.
- Deploy page shows sticky live status, QR code, copy URL, and streamed logs.
- `/[owner]/[repo]/status/[id]` deep-link for sharing build progress.
- Theme toggle, responsive layout, skeleton states, and friendly 404/error pages included.

## Mobile screenshots
Capture from a mobile viewport after running `npm run dev`:
1) Landing hero with quick deploy form  
2) Deploy form with env vars + status rail  
3) Status page with logs  
Place captures in `docs/screenshots/` if you generate them. A placeholder README is included.
