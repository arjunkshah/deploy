"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, ExternalLinkIcon, GearIcon } from "@radix-ui/react-icons";

import { SiteHeaderClient } from "@/components/SiteHeaderClient";

type DeploymentStatus = "QUEUED" | "BUILDING" | "READY" | "ERROR";

interface DeploymentRow {
  id: string;
  repo: string;
  url: string | null;
  status: DeploymentStatus;
  createdAt: string;
}

interface WorkerStatus {
  online: boolean;
  status: string;
  lastSeen: string | null;
}

type SessionState =
  | { status: "loading"; email?: string | null }
  | { status: "authenticated"; email?: string | null }
  | { status: "unauthenticated"; email?: null };

const formatRelative = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const diffMs = date.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  return rtf.format(diffDays, "day");
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [deployments, setDeployments] = useState<DeploymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | "ALL">("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [session.status, refreshKey]);

  useEffect(() => {
    let active = true;
    const loadWorker = async () => {
      if (session.status !== "authenticated") return;
      try {
        const res = await fetch("/api/worker");
        if (!res.ok) return;
        const data = await res.json();
        if (active) {
          setWorkerStatus({
            online: Boolean(data.online),
            status: data.status ?? "unknown",
            lastSeen: data.lastSeen ?? null
          });
        }
      } catch {
        if (active) setWorkerStatus(null);
      }
    };

    loadWorker();
    const interval = setInterval(loadWorker, 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session.status, refreshKey]);

  const email = session.status === "authenticated" ? session.email ?? null : null;
  const isLoading = session.status === "loading" || loading;

  const sortedDeployments = useMemo(() => {
    return [...deployments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [deployments]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = sortedDeployments.filter((deployment) => {
      const repo = deployment.repo ?? "";
      const matchesQuery = normalizedQuery ? repo.toLowerCase().includes(normalizedQuery) : true;
      const matchesStatus = statusFilter === "ALL" ? true : deployment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return filtered.map((deployment) => {
      const repo = deployment.repo ?? "unknown/repo";
      const repoName = repo.split("/")[1] ?? repo;
      const slug = encodeURIComponent(repo);
      const settingsHref = `/settings/${slug}` as Route;
      const statusHref = `/${slug}/status/${deployment.id}` as Route;
      const displayDomain = deployment.url ? deployment.url.replace(/^https?:\/\//, "") : null;
      const domain = displayDomain ? `https://${displayDomain}` : "-";
      const status = deployment.status ?? "ERROR";
      const statusLabel = status.toLowerCase();
      const isReady = status === "READY";
      return {
        deployment,
        repo,
        repoName,
        settingsHref,
        statusHref,
        domain,
        displayDomain,
        statusLabel,
        isReady
      };
    });
  }, [sortedDeployments, query, statusFilter]);

  const stats = useMemo(() => {
    const total = deployments.length;
    const ready = deployments.filter((deployment) => deployment.status === "READY").length;
    const building = deployments.filter((deployment) =>
      deployment.status === "BUILDING" || deployment.status === "QUEUED"
    ).length;
    const errorCount = deployments.filter((deployment) => deployment.status === "ERROR").length;
    return { total, ready, building, errorCount };
  }, [deployments]);

  const highlights = useMemo(() => {
    const latest = sortedDeployments[0];
    const lastReady = sortedDeployments.find((deployment) => deployment.status === "READY");
    const lastError = sortedDeployments.find((deployment) => deployment.status === "ERROR");
    return { latest, lastReady, lastError };
  }, [sortedDeployments]);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeaderClient active="dashboard" authenticated={session.status === "authenticated"} email={email} />
      <main className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Deployments</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
            {workerStatus && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${workerStatus.online ? "bg-primary" : "bg-rose-500"}`} />
                <span className="text-foreground">
                  Worker {workerStatus.online ? "online" : "offline"}
                </span>
                {workerStatus.lastSeen && (
                  <span className="text-muted-foreground">
                    · last seen {new Date(workerStatus.lastSeen).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="rounded-full border border-border/80 bg-card px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
            >
              New Project
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl border border-border/70 bg-card p-5 text-sm text-muted-foreground lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-semibold text-foreground">{stats.total}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ready</div>
                <div className="text-lg font-semibold text-foreground">{stats.ready}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Building</div>
                <div className="text-lg font-semibold text-foreground">{stats.building}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Errors</div>
                <div className="text-lg font-semibold text-foreground">{stats.errorCount}</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by repo name"
                className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground/40"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "READY", "BUILDING", "QUEUED", "ERROR"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? "border-foreground/40 bg-foreground text-background"
                      : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status === "ALL" ? "All" : status.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Latest activity</p>
            <div className="mt-4 space-y-4 text-muted-foreground">
              {highlights.latest ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{highlights.latest.repo}</span>
                    <span className="text-xs">{formatRelative(highlights.latest.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="uppercase tracking-[0.2em] text-muted-foreground">
                      {highlights.latest.status}
                    </span>
                    {highlights.latest.url && (
                      <span className="font-mono text-foreground">https://{highlights.latest.url}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No deployments yet.</p>
              )}
              {highlights.lastReady && (
                <div className="rounded-xl border border-border/70 bg-background px-4 py-3 text-xs">
                  <div className="text-muted-foreground">Most recent ready</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">{highlights.lastReady.repo}</span>
                    <span>{formatRelative(highlights.lastReady.createdAt)}</span>
                  </div>
                </div>
              )}
              {highlights.lastError && (
                <div className="rounded-xl border border-border/70 bg-rose-500/10 px-4 py-3 text-xs text-rose-600">
                  Last failed deploy: {highlights.lastError.repo}
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Quick actions</p>
            <div className="mt-4 space-y-3">
              {(
                [
                  { label: "Start a new deploy", href: "/" as Route },
                  { label: "Read the docs", href: "/docs" as Route },
                  { label: "Manage domains", href: "/docs#domains" as Route }
                ] as const
              ).map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>{action.label}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_20px_50px_-40px_rgba(15,23,42,0.2)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4 font-normal">Project</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Domain</th>
                <th className="px-6 py-4 font-normal">Status URL</th>
                <th className="px-6 py-4 text-right font-normal">Updated</th>
                <th className="w-12 px-6 py-4 font-normal" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground">
                    Loading deployments...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-rose-600">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-muted-foreground">
                    No deployments yet. Create your first deploy from the home page.
                  </td>
                </tr>
              )}
              {!isLoading &&
                rows.map(
                  ({ deployment, repo, repoName, settingsHref, statusHref, domain, displayDomain, statusLabel, isReady }) => (
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
                          {displayDomain}
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <Link
                        href={statusHref}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground underline underline-offset-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View status
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
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
                  )
                )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
