import { notFound, redirect } from "next/navigation";

import { DomainsManager } from "@/components/DomainsManager";
import { SiteHeader } from "@/components/SiteHeader";
import { getAuthSession } from "@/lib/auth";
import { parseSlug } from "@/lib/slug";
import * as db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params?: Promise<{ slug?: string | string[] }> }) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  const resolvedParams = params ? await params : {};
  const slugParam = resolvedParams.slug;
  if (!slugParam || Array.isArray(slugParam)) return notFound();

  const parsed = parseSlug(slugParam);
  if (!parsed) return notFound();
  const repoPath = `${parsed.owner}/${parsed.repo}`;
  const domains = await db.listDomains(repoPath).catch(() => []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader active="dashboard" />
      <main className="mx-auto flex max-w-5xl gap-12 px-6 py-24">
        <aside className="w-56 shrink-0">
          <div className="mb-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">Settings</div>
          <div className="mb-8 text-xl font-semibold text-foreground">{parsed.repo}</div>
          <nav className="space-y-1 text-sm text-muted-foreground">
            <a href="#" className="block py-1.5 font-medium text-foreground">
              General
            </a>
            <a href="#" className="block py-1.5 hover:text-foreground">
              Domains
            </a>
            <a href="#" className="block py-1.5 hover:text-foreground">
              Environment Variables
            </a>
            <a href="#" className="block py-1.5 hover:text-foreground">
              Git Integration
            </a>
          </nav>
        </aside>

        <div className="flex-1 space-y-12">
          <section>
            <h2 className="mb-6 border-b border-border/70 pb-4 text-xl font-semibold text-foreground">Project name</h2>
            <div className="flex max-w-md gap-4">
              <input
                type="text"
                defaultValue={parsed.repo}
                className="flex-1 rounded-md border border-border/80 bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/50"
              />
              <button className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                Save
              </button>
            </div>
          </section>

          <section>
            <h2 className="mb-6 border-b border-border/70 pb-4 text-xl font-semibold text-foreground">Root directory</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              The directory within your project where the code is located. Leave blank if it&apos;s the root.
            </p>
            <div className="flex max-w-md gap-4">
              <input
                type="text"
                placeholder="./"
                className="flex-1 rounded-md border border-border/80 bg-card px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-foreground/50"
              />
              <button className="rounded-full border border-border/80 bg-card px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground/40">
                Save
              </button>
            </div>
          </section>

          <section>
            <h2 className="mb-6 border-b border-border/70 pb-4 text-xl font-semibold text-foreground">Domains</h2>
            <p className="mb-4 text-sm text-muted-foreground">Add custom domains to point at this deployment.</p>
            <DomainsManager
              repo={repoPath}
              initialDomains={domains.map((domain) => ({ id: domain.id, domain: domain.domain }))}
            />
          </section>

          <section className="border-t border-border/70 pt-12">
            <h2 className="mb-6 text-xl font-semibold text-rose-600">Danger zone</h2>
            <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/60 p-6">
              <div>
                <h3 className="font-medium">Delete Project</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This action cannot be undone. This will permanently delete the project.
                </p>
              </div>
              <button className="rounded-full border border-rose-200 bg-card px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 transition-colors hover:bg-rose-600 hover:text-white">
                Delete
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
