import { notFound } from "next/navigation";

import { BuildStatus } from "@/components/BuildStatus";
import { SiteHeader } from "@/components/SiteHeader";
import { parseSlug } from "@/lib/slug";
import * as db from "@/lib/db";

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <BuildStatus deploymentId={deploymentId} initialUrl={record?.url ?? null} repoPath={`${parsed.owner}/${parsed.repo}`} />
      </div>
    </div>
  );
}
