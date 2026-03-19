"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ExternalLinkIcon, GearIcon } from "@radix-ui/react-icons";

import { SiteHeaderClient } from "@/components/SiteHeaderClient";

type DeploymentStatus = "QUEUED" | "BUILDING" | "READY" | "ERROR";

interface DeploymentRow {
  id: string;
  repo: string;
  url: string | null;
  status: DeploymentStatus;
  createdAt: string;
}

type SessionState =
  | { status: "loading"; email?: string | null }
  | { status: "authenticated"; email?: string | null }
  | { status: "unauthenticated"; email?: null };

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [deployments, setDeployments] = useState<DeploymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          if (active) setSession({ status: "unauthenticated" });
          return;
        }
        const data = await res.json();
        const email = data?.user?.email ?? null;
        if (!email) {
          if (active) setSession({ status: "unauthenticated" });
          return;
        }
        if (active) setSession({ status: "authenticated", email });
      } catch {
        if (active) setSession({ status: "unauthenticated" });
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, session.status]);

  useEffect(() => {
    let active = true;
    const loadDeployments = async () => {
      if (session.status !== "authenticated") return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/deployments");
        if (!res.ok) {
          if (active) {
            setDeployments([]);
            setError("Unable to load deployments.");
          }
          return;
        }
        const data = await res.json();
        if (active) setDeployments(data.deployments ?? []);
      } catch {
        if (active) {
          setDeployments([]);
          setError("Unable to load deployments.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDeployments();
    return () => {
      active = false;
    };
  }, [session.status]);

  const email = session.status === "authenticated" ? session.email ?? null : null;
  const isLoading = session.status === "loading" || loading;

  const rows = useMemo(() => {
    return deployments.map((deployment) => {
      const repo = deployment.repo ?? "unknown/repo";
      const repoName = repo.split("/")[1] ?? repo;
      const slug = encodeURIComponent(repo);
      const settingsHref = `/settings/${slug}` as Route;
      const domain = deployment.url ? `https://${deployment.url}` : "-";
      const status = deployment.status ?? "ERROR";
      const statusLabel = status.toLowerCase();
      const isReady = status === "READY";
      return {
        deployment,
        repo,
        repoName,
        settingsHref,
        domain,
        statusLabel,
        isReady
      };
    });
  }, [deployments]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeaderClient active="dashboard" authenticated={session.status === "authenticated"} email={email} />
      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Deployments</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-border/80 bg-card px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
          >
            New Project
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_20px_50px_-40px_rgba(15,23,42,0.2)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4 font-normal">Project</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Domain</th>
                <th className="px-6 py-4 text-right font-normal">Updated</th>
                <th className="w-12 px-6 py-4 font-normal" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-muted-foreground">
                    Loading deployments...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-muted-foreground">
                    No deployments yet. Create your first deploy from the home page.
                  </td>
                </tr>
              )}
              {!isLoading &&
                rows.map(({ deployment, repo, repoName, settingsHref, domain, statusLabel, isReady }) => (
                  <tr key={deployment.id} className="group cursor-pointer transition-colors hover:bg-muted/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{repoName}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{repo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isReady ? "bg-primary" : "bg-rose-500"}`} />
                        <span className="capitalize text-muted-foreground">{statusLabel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {domain !== "-" ? (
                        <a
                          href={domain}
                          className="flex items-center gap-1 hover:text-foreground"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {deployment.url}
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {new Date(deployment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground transition-colors group-hover:text-foreground">
                      <Link href={settingsHref} onClick={(event) => event.stopPropagation()} aria-label="Project settings">
                        <GearIcon className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
