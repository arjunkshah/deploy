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
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userEmail = session.user?.email ?? null;

    const ip = getClientIp(request);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down." },
        { status: 429, headers: { "Retry-After": `${Math.ceil(rate.retryAfter / 1000)}` } }
      );
    }

    const json = await request.json();
    const parsed = bodySchema.parse(json);

    const repoData = await github.getRepo(parsed.owner, parsed.repo);
    const envVars = normalizeEnvVars(parsed.envVars ?? []);
    const projectName = sanitizeProjectName(`deploy-${parsed.owner}-${parsed.repo}-${Date.now()}`);
    const ref = parsed.branch || repoData.default_branch;
    const repoSizeKb = repoData.size ?? 0;
    const archiveLimitKb = 120_000;
    const useWorker = process.env.DEPLOY_USE_WORKER !== "false";

    if (useWorker) {
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

      return NextResponse.json({ deploymentId: jobId, queued: true });
    }

    const deployFromGit = async () => {
      const project = await vercel.createProject({
        name: projectName,
        gitRepository: { type: "github", repo: `${parsed.owner}/${parsed.repo}` },
        framework: null,
        buildCommand: null,
        outputDirectory: null
      });

      try {
        if (envVars.length) {
          await vercel.setEnvVars(project.id, envVars);
        }

        const deployment = await vercel.triggerDeploy({
          projectId: project.id,
          ref,
          repoId: repoData.id
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
        await vercel.deleteProject(project.id).catch(() => null);
        throw error;
      }
    };

    const deployFromArchive = async () => {
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

        if (envVars.length) {
          await vercel.setEnvVars(project.id, envVars);
        }

        const inline = shouldInlineFiles(stats);
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
