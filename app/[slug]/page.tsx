import { notFound } from "next/navigation";

import { DeployForm } from "@/components/DeployForm";
import { SiteHeader } from "@/components/SiteHeader";
import { parseEnvQuery } from "@/lib/env";
import * as github from "@/lib/github";
import { parseSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export default async function DeployPage({
  params,
  searchParams
}: {
  params?: Promise<{ slug?: string | string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = params ? await params : {};
  const resolvedSearch = searchParams ? await searchParams : {};

  const slugParam = resolvedParams.slug;
  if (!slugParam || Array.isArray(slugParam)) return notFound();

  const parsed = parseSlug(slugParam);
  if (!parsed) return notFound();

  const branchParam = typeof resolvedSearch.branch === "string" ? resolvedSearch.branch : undefined;
  const envPreset = parseEnvQuery(typeof resolvedSearch.env === "string" ? resolvedSearch.env : undefined);

  let repo;
  try {
    repo = await github.getRepo(parsed.owner, parsed.repo);
  } catch (error) {
    console.error(error);
    return notFound();
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <DeployForm
          owner={parsed.owner}
          repo={parsed.repo}
          defaultBranch={repo.default_branch}
          initialBranch={branchParam}
          initialEnv={envPreset}
          repoDescription={repo.description}
        />
      </div>
    </div>
  );
}
