# Deploy Worker

This worker runs on a separate VM/container. It clones repos and deploys them with the Vercel CLI.

## Requirements
- Node.js 18+
- `git`
- `vercel` CLI (`npm i -g vercel`)

## Environment variables
- `POSTGRES_URL` (same database as the Deploy.com app)
- `VERCEL_TOKEN` (Vercel API token with deploy permissions)
- `DEPLOY_WORKER_POLL_MS` (optional, default: 5000)

## Run
```
node worker/worker.js
```

The API queues jobs in `deploy_jobs`. The worker picks them up, deploys, and writes logs/status back to the DB.
