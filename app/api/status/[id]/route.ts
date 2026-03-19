import { NextResponse } from "next/server";

import * as db from "@/lib/db";
import * as jobs from "@/lib/jobs";
import * as vercel from "@/lib/vercel";

export async function GET(_req: Request, { params }: { params: Promise<{ id?: string | string[] }> }) {
  try {
    const resolvedParams = await params;
    const deploymentId = resolvedParams.id;
    if (!deploymentId || Array.isArray(deploymentId)) {
      console.log("[status] invalid deployment id");
      return NextResponse.json({ error: "Missing deployment id" }, { status: 400 });
    }
    console.log("[status] checking deployment", deploymentId);

    const job = await jobs.getJob(deploymentId);
    if (job) {
      console.log("[status] job found", { id: job.id, status: job.status });
      const isReady = job.status === "READY";
      const isError = job.status === "ERROR";
      const status = isReady ? "READY" : isError ? "ERROR" : "BUILDING";
      return NextResponse.json({
        status,
        step: job.status,
        url: job.url ?? null,
        ready: status === "READY",
        logs: job.logs ?? job.error ?? "Queued for deployment."
      });
    }

    const record = await db.getDeployment(deploymentId);
    console.log("[status] no job found, checking Vercel", { id: deploymentId, hasRecord: Boolean(record) });

    const vercelStatus = await vercel.getDeploymentStatus(deploymentId);
    const status =
      vercelStatus.readyState === "READY"
        ? "READY"
        : vercelStatus.readyState === "ERROR"
          ? "ERROR"
          : "BUILDING";

    if (record) {
      await db.updateDeploymentStatus(deploymentId, status as db.DeploymentStatus, vercelStatus.url);
    }

    const events = await vercel.getDeploymentEvents(deploymentId);
    const logs = events
      .slice(-20)
      .map((event) => `${new Date(event.created).toLocaleTimeString()} - ${event.payload?.text ?? event.type}`)
      .join("\n");

    console.log("[status] Vercel status", { id: deploymentId, readyState: vercelStatus.readyState });
    return NextResponse.json({
      status,
      step: vercelStatus.readyState,
      url: `https://${vercelStatus.url}`,
      ready: status === "READY",
      logs
    });
  } catch (error) {
    console.log("[status] error", error instanceof Error ? error.message : error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.includes("404") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
