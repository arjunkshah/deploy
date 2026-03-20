import { notFound } from "next/navigation";

import { BuildStatus } from "@/components/BuildStatus";
import { SiteHeader } from "@/components/SiteHeader";
import { parseSlug } from "@/lib/slug";
import * as db from "@/lib/db";

export const dynamic = "force-dynamic";

const formatRelative = (value?: Date | null) => {
  if (!value) return "Unknown";
  const diffMs = value.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  return rtf.format(diffDays, "day");
};

export default async function StatusPage({
  params
}: {
  params?: Promise<{ slug?: string | string[]; deploymentId?: string | string[] }>;
}) {
  const resolvedParams = params ? await params : {};
  const slugParam = resolvedParams.slug;
  const deploymentId = resolvedParams.deploymentId;

  if (!slugParam || Array.isArray(slugParam) || !deploymentId || Array.isArray(deploymentId)) return notFound();

  const parsed = parseSlug(slugParam);
  if (!parsed) return notFound();

  const record = await db.getDeployment(deploymentId);
  const envCount = record ? Object.keys(record.envVars ?? {}).length : 0;
  const repoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr]">
        <BuildStatus
          deploymentId={deploymentId}
          initialUrl={record?.url ?? null}
          repoPath={`${parsed.owner}/${parsed.repo}`}
        />
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Deployment details</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Repository</span>
                <a className="font-mono text-foreground underline underline-offset-4" href={repoUrl} target="_blank" rel="noreferrer">
                  {parsed.owner}/{parsed.repo}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span>Branch</span>
                <span className="font-mono text-foreground">{record?.branch ?? "main"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Env vars</span>
                <span className="font-mono text-foreground">{envCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Started</span>
                <span className="font-mono text-foreground">
                  {record?.createdAt ? record.createdAt.toLocaleString() : "Just now"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Expires</span>
                <span className="font-mono text-foreground">{formatRelative(record?.expiresAt)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Actions</p>
            <div className="mt-4 flex flex-col gap-3">
              {record?.url && (
                <a
                  href={`https://${record.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
                >
                  Open deployment
                </a>
              )}
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
              >
                View repository
              </a>
              <a
                href="/docs#worker"
                className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
              >
                Worker setup
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
