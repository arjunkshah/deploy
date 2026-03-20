import fs from "node:fs/promises";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { extractTarballToUploadedFiles, shouldInlineFiles } from "@/lib/archive";
import * as db from "@/lib/db";
import { normalizeEnvVars } from "@/lib/env";
import * as github from "@/lib/github";
import * as jobs from "@/lib/jobs";
import { checkRateLimit } from "@/lib/rate-limit";
import * as vercel from "@/lib/vercel";

const bodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().min(1).default("main"),
  envVars: z.array(z.object({ key: z.string(), value: z.string() })).optional()
});

function sanitizeProjectName(name: string) {
  const lowered = name.toLowerCase();
  let safe = lowered.replace(/[^a-z0-9._-]+/g, "-");
  safe = safe.replace(/-+/g, "-").replace(/\.+/g, ".").replace(/^-+|-+$/g, "");
  if (!safe) safe = "deploy";
  if (safe.length > 90) safe = safe.slice(0, 90);
  return safe;
}

function getClientIp(request: Request) {
  const header = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (!header) return "unknown";
  return header.split(",")[0]?.trim() || "unknown";
}

function isMissingGitHubApp(error: unknown) {
  if (!(error instanceof vercel.VercelApiError)) return false;
  const message = error.message.toLowerCase();
  const action = error.action?.toLowerCase() ?? "";
  const link = error.link?.toLowerCase() ?? "";
  return (
    message.includes("install the github app") ||
    message.includes("github integration") ||
    action.includes("install") ||
    link.includes("github.com/apps/vercel")
  );
}

export async function POST(request: Request) {
  try {
    console.log("[deploy] request received");
    const session = await getAuthSession();
    if (!session) {
      console.log("[deploy] missing session");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userEmail = session.user?.email ?? null;
    console.log("[deploy] authenticated user", userEmail ?? "unknown");

    const ip = getClientIp(request);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      console.log("[deploy] rate limit hit", { ip });
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down." },
        { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfter / 1000)}` } }
      );
    }

    const json = await request.json();
    const parsed = bodySchema.parse(json);
    console.log("[deploy] parsed payload", {
      owner: parsed.owner,
      repo: parsed.repo,
      branch: parsed.branch,
      envCount: parsed.envVars?.length ?? 0
    });

    const repoData = await github.getRepo(parsed.owner, parsed.repo);
    console.log("[deploy] repo validated", {
      fullName: repoData.full_name,
      defaultBranch: repoData.default_branch,
      sizeKb: repoData.size
    });
    const envVars = normalizeEnvVars(parsed.envVars ?? []);
    const projectName = sanitizeProjectName(`deploy-${parsed.owner}-${parsed.repo}-${Date.now()}`);
    const ref = parsed.branch || repoData.default_branch;
    const repoSizeKb = repoData.size ?? 0;
    const archiveLimitKb = 120_000;
    const workerRequired = repoSizeKb > archiveLimitKb;
    const workerPreferred = process.env.DEPLOY_USE_WORKER === "true";
    let useWorker = workerRequired || workerPreferred;

    if (useWorker) {
      const workerOnline = await jobs.isWorkerOnline();
      if (!workerOnline) {
        if (workerRequired) {
          return NextResponse.json(
            {
              error: "Worker is offline. Start the worker VM to deploy large repositories.",
              actionUrl: "/docs#worker"
            },
            { status: 503 }
          );
        }
        if (workerPreferred) {
          return NextResponse.json(
            {
              error: "Worker is offline. Start the worker VM or disable DEPLOY_USE_WORKER.",
              actionUrl: "/docs#worker"
            },
            { status: 503 }
          );
        }
        useWorker = false;
      }
    }

    if (useWorker) {
      console.log("[deploy] enqueueing worker job");
      const jobId = crypto.randomUUID();
      const projectName = sanitizeProjectName(`deploy-${parsed.owner}-${parsed.repo}-${Date.now()}`);
      await jobs.createJob({
        id: jobId,
        owner: parsed.owner,
        repo: parsed.repo,
        branch: ref,
        envVars: Object.fromEntries(envVars.map((env) => [env.key, env.value])),
        projectName,
        userEmail
      });
      console.log("[deploy] job created", { jobId, projectName });

      await db.insertDeployment({
        id: jobId,
        projectId: "",
        repo: `${parsed.owner}/${parsed.repo}`,
        branch: ref,
        envVars: Object.fromEntries(envVars.map((env) => [env.key, env.value])),
        url: null,
        status: "QUEUED",
        userEmail
      });
      console.log("[deploy] deployment row created", { jobId });

      return NextResponse.json({ deploymentId: jobId, queued: true });
    }

    const deployFromGit = async () => {
      console.log("[deploy] attempting GitHub App deploy");
      const project = await vercel.createProject({
        name: projectName,
        gitRepository: { type: "github", repo: `${parsed.owner}/${parsed.repo}` },
        framework: null,
        buildCommand: null,
        outputDirectory: null
      });

      try {
        if (envVars.length) {
          console.log("[deploy] setting env vars", { count: envVars.length });
          await vercel.setEnvVars(project.id, envVars);
        }

        console.log("[deploy] triggering Vercel deploy", { projectId: project.id, ref });
        const deployment = await vercel.triggerDeploy({
          projectId: project.id,
          ref,
          repoId: repoData.id
        });
        console.log("[deploy] deployment triggered", { deploymentId: deployment.id });

        await db.insertDeployment({
          id: deployment.id,
          projectId: project.id,
          repo: `${parsed.owner}/${parsed.repo}`,
          branch: ref,
          envVars: Object.fromEntries(envVars.map((env) => [env.key, env.value])),
          url: deployment.url,
          status: "BUILDING",
          userEmail
        });

        return NextResponse.json({
          deploymentId: deployment.id,
          projectId: project.id,
          url: deployment.url
        });
      } catch (error) {
        console.log("[deploy] git deploy failed, cleaning project", { projectId: project.id });
        await vercel.deleteProject(project.id).catch(() => null);
        throw error;
      }
    };

    const deployFromArchive = async () => {
      console.log("[deploy] falling back to archive deploy");
      const archive = await github.downloadRepoArchive(parsed.owner, parsed.repo, ref);
      const { files, stats, cleanup } = await extractTarballToUploadedFiles(archive);
      if (files.length === 0) {
        await cleanup();
        return NextResponse.json({ error: "Repository archive contained no deployable files." }, { status: 400 });
      }

      try {
        const project = await vercel.createProject({
          name: projectName,
          framework: null,
          buildCommand: null,
          outputDirectory: null
        });
        console.log("[deploy] project created for archive", { projectId: project.id });

        if (envVars.length) {
          console.log("[deploy] setting env vars", { count: envVars.length });
          await vercel.setEnvVars(project.id, envVars);
        }

        const inline = shouldInlineFiles(stats);
        console.log("[deploy] archive stats", { inline, files: files.length, bytes: stats.totalBytes });
        let deploymentFiles:
          | vercel.InlineFileInput[]
          | { file: string; sha: string; size: number; mode?: number }[];

        if (inline) {
          deploymentFiles = await Promise.all(
            files.map(async (file) => {
              const buffer = await fs.readFile(file.absolutePath as string);
              return {
                file: file.file,
                data: buffer.toString("base64"),
                encoding: "base64" as const
              };
            })
          );
        } else {
          console.log("[deploy] uploading files to Vercel");
          for (const file of files) {
            const buffer = await fs.readFile(file.absolutePath as string);
            await vercel.uploadDeploymentFile(file.sha, buffer);
          }
          deploymentFiles = files.map((file) => ({
            file: file.file,
            sha: file.sha,
            size: file.size,
            mode: file.mode
          }));
        }

        console.log("[deploy] creating deployment from files");
        const deployment = await vercel.createDeploymentFromFiles({
          name: projectName,
          projectId: project.id,
          files: deploymentFiles,
          projectSettings: {
            framework: null,
            buildCommand: null,
            outputDirectory: null,
            skipGitConnectDuringLink: true
          }
        });

        await db.insertDeployment({
          id: deployment.id,
          projectId: project.id,
          repo: `${parsed.owner}/${parsed.repo}`,
          branch: ref,
          envVars: Object.fromEntries(envVars.map((env) => [env.key, env.value])),
          url: deployment.url,
          status: "BUILDING",
          userEmail
        });

        return NextResponse.json({
          deploymentId: deployment.id,
          projectId: project.id,
          url: deployment.url
        });
      } catch (error) {
        console.log("[deploy] archive deploy failed", error instanceof Error ? error.message : error);
        throw error;
      } finally {
        await cleanup();
      }
    };

    try {
      return await deployFromGit();
    } catch (error) {
      if (!isMissingGitHubApp(error)) {
        throw error;
      }
      console.log("[deploy] GitHub App missing or unauthorized");
      if (repoSizeKb > archiveLimitKb) {
        return NextResponse.json(
          {
            error:
              "This repository is large and requires the Vercel GitHub App to be installed and authorized for this repo.",
            actionUrl: "https://github.com/apps/vercel"
          },
          { status: 400 }
        );
      }
    }

    return await deployFromArchive();
  } catch (error) {
    console.log("[deploy] error", error instanceof Error ? error.message : error);
    if (error instanceof vercel.VercelApiError) {
      return NextResponse.json(
        { error: error.message, actionUrl: error.link },
        { status: error.status || 500 }
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected error";
    const status =
      message.toLowerCase().includes("private") ||
      message.includes("404") ||
      message.toLowerCase().includes("github") ||
      message.toLowerCase().includes("repository") ||
      message.toLowerCase().includes("deployable files") ||
      message.toLowerCase().includes("repository is too large") ||
      message.toLowerCase().includes("too many files") ||
      message.toLowerCase().includes("file too large")
        ? 400
        : 500;
    const actionUrl =
      message.toLowerCase().includes("too many files") || message.toLowerCase().includes("too large")
        ? "https://github.com/apps/vercel"
        : undefined;
    return NextResponse.json({ error: message, actionUrl }, { status });
  }
}

export const runtime = "nodejs";
