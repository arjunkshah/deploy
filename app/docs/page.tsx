import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-static";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "quickstart", label: "Quickstart" },
  { id: "url-format", label: "URL format" },
  { id: "env-vars", label: "Environment variables" },
  { id: "auth", label: "Authentication" },
  { id: "agentbar", label: "AgentBar widget" },
  { id: "worker", label: "Worker (large repos)" },
  { id: "pipeline", label: "Deployment pipeline" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "api", label: "API" },
  { id: "domains", label: "Custom domains" },
  { id: "cleanup", label: "Cleanup" },
  { id: "security", label: "Security" },
  { id: "testing", label: "Testing" },
  { id: "troubleshooting", label: "Troubleshooting" }
];

export default function DocsPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Docs</p>
            <nav className="space-y-2">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  {section.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-16">
          <div className="flex gap-2 overflow-x-auto pb-2 text-xs text-muted-foreground lg:hidden">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap rounded-full border border-border/70 bg-card px-3 py-1 text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </div>
          <section id="overview" className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Deploy.com documentation</h1>
            <p className="text-base text-muted-foreground">
              Deploy.com lets anyone deploy a public GitHub repository by swapping the domain. It validates the repo,
              queues a deployment, and streams status updates until the live URL is ready.
            </p>
            <div className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
              Open-source friendly: issue templates, CI checks, and docs live alongside the app code.
            </div>
          </section>

          <section id="features" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "URL-based deploys",
                "Branch and env support",
                "Live build logs",
                "Shareable status links",
                "Custom domains",
                "Auth-gated deploys",
                "Automatic cleanup",
                "Worker for large repos",
                "Per-deploy history",
                "Public repo validation",
                "Status timeline"
              ].map((feature) => (
                <div key={feature} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <section id="quickstart" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quickstart</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>1. Install dependencies with `npm install`.</li>
              <li>2. Copy `.env.local.example` to `.env.local` and fill required secrets.</li>
              <li>3. Start dev server with `npm run dev`.</li>
              <li>4. Open `http://localhost:3000/vercel/next.js` to deploy a repo.</li>
            </ol>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`cp .env.local.example .env.local
npm install
npm run dev`}
            </pre>
          </section>

          <section id="url-format" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">URL format</h2>
            <p className="text-sm text-muted-foreground">
              Replace `github.com` with your Deploy.com domain and optionally include branch and env vars.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`deploydotcom.vercel.app/owner/repo
deploydotcom.vercel.app/owner/repo?branch=main
deploydotcom.vercel.app/owner/repo?env=API_KEY=abc,DB_URL=postgres://...`}
            </pre>
          </section>

          <section id="env-vars" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Environment variables</h2>
            <p className="text-sm text-muted-foreground">
              Add env vars in the deploy form or via `?env=` query strings. Values are encrypted when stored on Vercel.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`?env=API_KEY=abc,DB_URL=postgres://user:pass@host/db
POST /api/deploy
{ "envVars": [{ "key": "API_KEY", "value": "abc" }] }`}
            </pre>
          </section>

          <section id="auth" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Authentication</h2>
            <p className="text-sm text-muted-foreground">
              Deploys require a signed-in user. Enable Google OAuth by setting `GOOGLE_CLIENT_ID` and
              `GOOGLE_CLIENT_SECRET`, or use email/password credentials stored in Postgres.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://deploydotcom.vercel.app`}
            </pre>
          </section>

          <section id="agentbar" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">AgentBar widget</h2>
            <p className="text-sm text-muted-foreground">
              Deploy.com ships with the AgentBar script embedded at the root layout. Update the data attributes to
              change behavior and branding.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`<script
  src="https://agent-pug.vercel.app/agentbar.js"
  data-site="arjunshah.com"
  data-api="https://agent-pug.vercel.app"
  data-depth="1"
  data-max-pages="15"
  data-theme-color="#059669"
  data-position="right"
  data-title="Site Assistant"
  data-subtitle="Ask anything about this site."
  data-button-label="Ask"
></script>`}
            </pre>
          </section>

          <section id="worker" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Worker (large repos)</h2>
            <p className="text-sm text-muted-foreground">
              Large repositories are handled by a separate worker VM. It clones the repo and runs `vercel deploy --prod`
              to avoid serverless limits.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`node worker/worker.js

POSTGRES_URL=...
VERCEL_TOKEN=...
DEPLOY_WORKER_POLL_MS=5000`}
            </pre>
            <div className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
              Logs stream from the worker into the `deploy_jobs` table and appear in the status UI in near real time.
            </div>
          </section>

          <section id="pipeline" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Deployment pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Each deploy moves through a deterministic pipeline. The status page mirrors these steps.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "QUEUED — waiting for the worker",
                "CLONING — repository fetch",
                "DEPLOYING — Vercel build + release",
                "READY — live URL available",
                "ERROR — failed; check logs"
              ].map((step) => (
                <div key={step} className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground">
                  {step}
                </div>
              ))}
            </div>
          </section>

          <section id="rate-limits" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Rate limits</h2>
            <p className="text-sm text-muted-foreground">
              Deploy.com enforces a per-IP limit to protect the API and build queue.
            </p>
            <div className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
              Default limit: 5 deploys per minute per IP. Adjust in `lib/rate-limit.ts`.
            </div>
          </section>

          <section id="api" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">API</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <p className="font-medium text-foreground">POST /api/deploy</p>
                <p className="mt-2">Queues a deployment job and returns a `deploymentId`.</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <p className="font-medium text-foreground">GET /api/status/:id</p>
                <p className="mt-2">Returns status, logs, and final URL when ready.</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <p className="font-medium text-foreground">GET /api/deployments</p>
                <p className="mt-2">Lists recent deployments for the signed-in user.</p>
              </div>
            </div>
          </section>

          <section id="domains" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Custom domains</h2>
            <p className="text-sm text-muted-foreground">
              Each deployment can store custom domain entries. Use the dashboard settings page to add or remove domains.
            </p>
          </section>

          <section id="cleanup" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Cleanup</h2>
            <p className="text-sm text-muted-foreground">
              Deployments expire after 7 days. Trigger `/api/cleanup` via a Vercel cron to remove expired projects and
              database rows.
            </p>
          </section>

          <section id="security" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Security</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Secrets</p>
                <p>Env vars are sent to Vercel as encrypted secrets; avoid logging values in client code.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Public repos only</p>
                <p>Private repositories require explicit Vercel GitHub App access to be deployable.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Worker isolation</p>
                <p>Run the worker in a dedicated VM with least-privilege credentials.</p>
              </div>
            </div>
          </section>

          <section id="testing" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Testing</h2>
            <p className="text-sm text-muted-foreground">
              Use the built-in healthcheck and load testing scripts to validate behavior under stress.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
{`npm run test
npm run healthcheck
npm run loadtest`}
            </pre>
          </section>

          <section id="troubleshooting" className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Troubleshooting</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Repo is too large</p>
                <p>Make sure the worker VM is running with `VERCEL_TOKEN` set.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Authentication errors</p>
                <p>Verify NextAuth secrets and OAuth credentials match your deployment URL.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">No logs are streaming</p>
                <p>Check the worker logs; the status endpoint reads from `deploy_jobs.logs`.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
