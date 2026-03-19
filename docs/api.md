# Deploy.com API

Base URL: `https://deploy.com`

## POST /api/deploy
Queues a new deployment. Large repositories are handled by the worker queue.

**Body**
```json
{
  "owner": "vercel",
  "repo": "next.js",
  "branch": "main",
  "envVars": [
    { "key": "API_KEY", "value": "abc123" },
    { "key": "DB_URL", "value": "postgres://..." }
  ]
}
```

**Responses**
- `200 OK` – `{ "deploymentId": "job_123", "queued": true }`
- `400` – repo missing or private
- `429` – rate limited (5/min/IP)
- `500` – unexpected error

## GET /api/status/{deploymentId}
Polls Vercel for status and recent events.

**Response**
```json
{
  "status": "BUILDING",
  "url": "https://myapp.vercel.app",
  "ready": false,
  "logs": "10:00:01 - Cloning\n10:00:10 - Ready"
}
```

## GET /api/deployments
Returns recent deployments for the signed-in user.

**Response**
```json
{
  "deployments": [
    {
      "id": "job_123",
      "repo": "vercel/next.js",
      "url": "https://example.vercel.app",
      "status": "READY",
      "createdAt": "2026-03-19T00:00:00.000Z"
    }
  ]
}
```

## POST /api/cleanup
Deletes expired deployments (7 days) and removes them from Postgres. Pair with a daily Vercel cron.

**Response**
```json
{ "removed": 2 }
```

## Errors
All errors return `{ "error": "message" }` with the appropriate HTTP status.
