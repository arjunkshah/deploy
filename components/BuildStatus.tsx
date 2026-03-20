"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type StatusState = "IDLE" | "QUEUED" | "BUILDING" | "READY" | "ERROR";
type StepState = "QUEUED" | "CLONING" | "DEPLOYING" | "READY" | "ERROR";

interface BuildStatusProps {
  deploymentId?: string | null;
  initialUrl?: string | null;
  repoPath: string;
}

export function BuildStatus({ deploymentId, initialUrl, repoPath }: BuildStatusProps) {
  const [status, setStatus] = useState<StatusState>(deploymentId ? "BUILDING" : "IDLE");
  const [step, setStep] = useState<StepState>("QUEUED");
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [logs, setLogs] = useState<string>("Waiting to start...");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const normalizeStep = (value?: string): StepState => {
    const normalized = String(value ?? "").toUpperCase();
    if (normalized === "READY") return "READY";
    if (normalized === "ERROR") return "ERROR";
    if (normalized === "CLONING") return "CLONING";
    if (normalized === "DEPLOYING") return "DEPLOYING";
    if (normalized === "QUEUED") return "QUEUED";
    if (normalized === "BUILDING") return "DEPLOYING";
    return "QUEUED";
  };

  const fetchStatus = useCallback(async () => {
    if (!deploymentId) return;
    try {
      const res = await fetch(`/api/status/${deploymentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to fetch status");
      setStatus((data.status as StatusState) ?? "BUILDING");
      setStep(normalizeStep(data.step));
      setUrl(data.url ?? null);
      setLogs(data.logs ?? "Building...");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to poll status");
    }
  }, [deploymentId]);

  useEffect(() => {
    if (!deploymentId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [deploymentId, fetchStatus]);

  const lines = logs.split("\n").filter(Boolean);
  const repoName = repoPath.split("/").pop() ?? repoPath;
  const steps = ["QUEUED", "CLONING", "DEPLOYING", "READY"] as const;
  const activeIndex = steps.indexOf(step === "ERROR" ? "DEPLOYING" : step);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.2)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-foreground">
            {status === "READY" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-primary" />
                Deployment complete
              </>
            ) : (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary/50" />
                Building {repoName}
              </>
            )}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">ID: {deploymentId}</p>
          {url && status === "READY" && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <a
                href={url}
                className="font-medium text-foreground underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                {url}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
              >
                {copied ? "Copied" : "Copy URL"}
              </button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {status === "READY" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40"
              >
                Go to dashboard
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border/70 bg-background p-4 text-xs">
        <div className="text-muted-foreground">Deployment progress</div>
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((stepName, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;
            return (
              <div key={stepName} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isComplete ? "bg-primary" : isActive ? "bg-primary/60 animate-pulse" : "bg-muted"
                  }`}
                />
                <span className={isActive || isComplete ? "text-foreground" : "text-muted-foreground"}>
                  {stepName.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
        {step === "QUEUED" && (
          <p className="text-muted-foreground">Queued. Waiting for the worker to pick this up.</p>
        )}
        {step === "ERROR" && <p className="text-rose-600">Deployment failed. Check the logs below.</p>}
      </div>

      {url && status === "READY" && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background p-4 text-xs text-muted-foreground">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Share</div>
            <p>Scan the code or copy the URL to share the live deployment.</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-2">
            <QRCodeSVG value={url} size={84} bgColor="transparent" fgColor="#0f172a" level="M" />
          </div>
        </div>
      )}

      <div className="relative h-[50vh] overflow-y-auto rounded-2xl border border-border/70 bg-muted/20 p-6 font-mono text-sm shadow-inner no-scrollbar">
        <div className="space-y-2">
          {lines.map((log, index) => (
            <motion.div
              key={`${log}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={log.toLowerCase().includes("ready") ? "text-foreground font-medium" : "text-muted-foreground"}
            >
              <span className="mr-4 select-none text-muted-foreground/40">{String(index + 1).padStart(2, "0")}</span>
              {log}
            </motion.div>
          ))}
          {(status === "BUILDING" || status === "QUEUED") && (
            <div className="flex items-center text-muted-foreground">
              <span className="mr-4 select-none text-muted-foreground/40">{String(lines.length + 1).padStart(2, "0")}</span>
              <span className="h-4 w-2 animate-[blink_1s_step-end_infinite] bg-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </motion.div>
  );
}
