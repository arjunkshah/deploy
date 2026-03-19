const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { sql } = require("@vercel/postgres");

const POLL_INTERVAL_MS = Number(process.env.DEPLOY_WORKER_POLL_MS ?? "5000");

const CREATE_JOBS_TABLE = `
CREATE TABLE IF NOT EXISTS deploy_jobs (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT NOT NULL,
  env_vars JSONB,
  status TEXT,
  project_name TEXT,
  url TEXT,
  logs TEXT,
  error TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

async function ensureJobsTable() {
  await sql.query(CREATE_JOBS_TABLE);
}

async function claimNextJob() {
  await ensureJobsTable();
  const { rows } = await sql`
    WITH next_job AS (
      SELECT id
      FROM deploy_jobs
      WHERE status = 'QUEUED'
      ORDER BY created_at ASC
      LIMIT 1
    )
    UPDATE deploy_jobs
    SET status = 'CLONING', updated_at = NOW()
    WHERE id IN (SELECT id FROM next_job)
    RETURNING id, owner, repo, branch, env_vars, project_name, user_email;
  `;
  return rows[0] ?? null;
}

async function appendJobLog(id, chunk) {
  const trimmed = String(chunk).replace(/\u0000/g, "");
  await sql`
    UPDATE deploy_jobs
    SET logs = CASE
      WHEN logs IS NULL THEN ${trimmed}
      ELSE RIGHT(logs || ${trimmed}, 12000)
    END,
    updated_at = NOW()
    WHERE id = ${id};
  `;
}

async function setJobStatus(id, status, options = {}) {
  await sql`
    UPDATE deploy_jobs
    SET status = ${status},
        url = COALESCE(${options.url ?? null}, url),
        error = COALESCE(${options.error ?? null}, error),
        updated_at = NOW()
    WHERE id = ${id};
  `;
}

async function updateDeploymentRecord(id, status, url) {
  await sql`
    UPDATE deployments
    SET status = ${status}, url = COALESCE(${url ?? null}, url)
    WHERE id = ${id};
  `;
}

function runCommand(command, args, options, onChunk) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.stdout.on("data", (data) => onChunk(String(data)));
    child.stderr.on("data", (data) => onChunk(String(data)));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s]+/g);
  if (!matches) return [];
  return matches.filter((url) => url.includes("vercel.app"));
}

async function handleJob(job) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "deploy-worker-"));
  let latestUrl = null;
  let buffer = "";
  let flushTimer = null;

  const flushLogs = async () => {
    if (!buffer) return;
    const payload = buffer;
    buffer = "";
    await appendJobLog(job.id, payload);
  };

  const queueLog = (chunk) => {
    buffer += chunk;
    const urls = extractUrls(chunk);
    if (urls.length) {
      latestUrl = urls[urls.length - 1];
    }
    if (!flushTimer) {
      flushTimer = setTimeout(async () => {
        flushTimer = null;
        await flushLogs();
      }, 800);
    }
  };

  try {
    const repoUrl = `https://github.com/${job.owner}/${job.repo}.git`;
    await setJobStatus(job.id, "CLONING");
    await updateDeploymentRecord(job.id, "BUILDING");
    queueLog(`Cloning ${repoUrl}\n`);
    await runCommand(
      "git",
      ["clone", "--depth", "1", "--branch", job.branch, repoUrl, tempDir],
      { stdio: "pipe" },
      queueLog
    );

    await setJobStatus(job.id, "DEPLOYING");
    await updateDeploymentRecord(job.id, "BUILDING");

    const envArgs = [];
    const envVars = job.env_vars ?? {};
    for (const [key, value] of Object.entries(envVars)) {
      envArgs.push("-e", `${key}=${value}`);
      envArgs.push("-b", `${key}=${value}`);
    }

    queueLog("Starting Vercel deployment\n");
    await runCommand(
      "vercel",
      [
        "deploy",
        "--prod",
        "--yes",
        "--token",
        process.env.VERCEL_TOKEN ?? "",
        "--name",
        job.project_name ?? `deploy-${job.owner}-${job.repo}`,
        ...envArgs
      ],
      { cwd: tempDir, stdio: "pipe", env: { ...process.env } },
      queueLog
    );

    await flushLogs();
    const finalUrl = latestUrl;
    if (!finalUrl) {
      throw new Error("Deployment completed but no URL was detected.");
    }

    await setJobStatus(job.id, "READY", { url: finalUrl });
    await updateDeploymentRecord(job.id, "READY", finalUrl);
  } catch (error) {
    await flushLogs();
    const message = error instanceof Error ? error.message : "Deployment failed";
    await setJobStatus(job.id, "ERROR", { error: message });
    await updateDeploymentRecord(job.id, "ERROR");
  } finally {
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!process.env.VERCEL_TOKEN) {
    throw new Error("Missing VERCEL_TOKEN for worker.");
  }

  await ensureJobsTable();

  while (true) {
    const job = await claimNextJob();
    if (job) {
      await handleJob(job);
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

main().catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
