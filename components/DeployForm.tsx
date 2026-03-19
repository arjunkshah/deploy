"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EnvVarRow, EnvVarsInput } from "@/components/EnvVarsInput";
import { MagneticButton } from "@/components/MagneticButton";
import { normalizeEnvVars } from "@/lib/env";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface DeployFormProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
  initialBranch?: string;
  initialEnv?: { key: string; value: string }[];
  repoDescription?: string | null;
  stars?: number;
  language?: string | null;
  readmeSnippet?: string | null;
  isAuthenticated?: boolean;
}

export function DeployForm({
  owner,
  repo,
  defaultBranch = "main",
  initialBranch,
  initialEnv = [],
  repoDescription,
  isAuthenticated = false
}: DeployFormProps) {
  const router = useRouter();
  const branch = initialBranch ?? defaultBranch;
  const [envRows, setEnvRows] = useState<EnvVarRow[]>(
    initialEnv.length
      ? initialEnv.map((env) => ({ id: crypto.randomUUID(), key: env.key, value: env.value }))
      : [{ id: crypto.randomUUID(), key: "DATABASE_URL", value: "" }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; actionUrl?: string } | null>(null);

  const filteredEnv = useMemo(() => normalizeEnvVars(envRows), [envRows]);

  const handleDeploy = async () => {
    try {
      if (!isAuthenticated) {
        const returnTo = `/${encodeURIComponent(`${owner}/${repo}`)}`;
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}` as Route);
        return;
      }
      setSubmitting(true);
      setError(null);
      const body = {
        owner,
        repo,
        branch,
        envVars: filteredEnv
      };
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status === 401) {
        const returnTo = `/${encodeURIComponent(`${owner}/${repo}`)}`;
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}` as Route);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError({ message: data.error ?? "Failed to trigger deploy", actionUrl: data.actionUrl });
        return;
      }
      const slug = encodeURIComponent(`${owner}/${repo}`);
      router.push(`/${slug}/status/${data.deploymentId}` as Route);
    } catch (err) {
      if (err instanceof Error) {
        setError({ message: err.message });
      } else {
        setError({ message: "Unable to deploy right now" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="space-y-3">
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{owner}</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-foreground">{repo}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Configure deployment</h1>
        <p className="text-sm text-muted-foreground">
          {repoDescription ? repoDescription : "Add environment variables and start the build."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.18)]">
          <EnvVarsInput rows={envRows} onChange={setEnvRows} />
        </div>

        <div className="space-y-6 rounded-2xl border border-border/70 bg-card p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Branch</p>
            <div className="mt-2 rounded-full border border-border/70 bg-background px-3 py-1 font-mono text-xs text-foreground">
              {branch}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Environment</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {filteredEnv.length ? `${filteredEnv.length} variables attached.` : "No variables attached."}
            </p>
          </div>
          {error && (
            <div className="space-y-2 text-xs text-rose-600">
              <p>{error.message}</p>
              {error.actionUrl && (
                <a
                  className="text-foreground underline underline-offset-4"
                  href={error.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Install Vercel GitHub App
                </a>
              )}
            </div>
          )}
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              Sign in is required before starting a deployment.
            </p>
          )}
          <MagneticButton
            type="button"
            onClick={handleDeploy}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Deploying..." : isAuthenticated ? "Start deployment" : "Sign in to deploy"}
            {!submitting && <ArrowRightIcon className="h-4 w-4" />}
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}
