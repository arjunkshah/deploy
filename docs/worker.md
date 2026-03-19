# Deploy Worker

The worker runs on a VM/container and handles large repositories by cloning and deploying them with the Vercel CLI.

## Requirements
- Node.js 18+
- `git`
- `vercel` CLI (`npm i -g vercel`)

## Environment variables
- `POSTGRES_URL` (same database as Deploy.com)
- `VERCEL_TOKEN` (Vercel token with deploy permissions)
- `DEPLOY_WORKER_POLL_MS` (optional, default: 5000)

## Run
```
node worker/worker.js
```

## How it works
- `POST /api/deploy` inserts a row into `deploy_jobs` and returns a `deploymentId`.
- The worker claims queued jobs, runs `git clone`, and executes `vercel deploy --prod`.
- Logs and final URL are persisted back to the DB and surfaced via `/api/status/{deploymentId}`.
