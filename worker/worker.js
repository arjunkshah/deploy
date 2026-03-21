const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { sql } = require("@vercel/postgres");

const POLL_INTERVAL_MS = Number(process.env.DEPLOY_WORKER_POLL_MS ?? "5000");
const LOG_PREFIX = "[worker]";
let idleLoops = 0;
const WORKER_ID = process.env.DEPLOY_WORKER_ID ?? "main";

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

const CREATE_WORKER_TABLE = `
CREATE TABLE IF NOT EXISTS deploy_worker_heartbeat (
  id TEXT PRIMARY KEY,
  status TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

async function ensureJobsTable() {
  console.log(`${LOG_PREFIX} ensuring deploy_jobs table exists`);
  await sql.query(CREATE_JOBS_TABLE);
}

async function ensureWorkerTable() {
  await sql.query(CREATE_WORKER_TABLE);
}

async function heartbeat(status) {
  await ensureWorkerTable();
  await sql`
    INSERT INTO deploy_worker_heartbeat (id, status, last_seen)
    VALUES (${WORKER_ID}, ${status}, NOW())
    ON CONFLICT (id) DO UPDATE SET status = ${status}, last_seen = NOW();
  `;
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
  const job = rows[0] ?? null;
  if (!job) {
    idleLoops += 1;
    if (idleLoops % 6 === 0) {
      console.log(`${LOG_PREFIX} no queued jobs, sleeping`, { pollMs: POLL_INTERVAL_MS });
    }
    return null;
  }
  idleLoops = 0;
  console.log(`${LOG_PREFIX} claimed job`, { id: job.id, repo: `${job.owner}/${job.repo}` });
  return job;
}

async function appendJobLog(id, chunk) {
  const trimmed = String(chunk).replace(/\u0000/g, "");
  if (!trimmed.trim()) return;
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
  console.log(`${LOG_PREFIX} status update`, { id, status, url: options.url ?? null });
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
  console.log(`${LOG_PREFIX} deployment record update`, { id, status, url: url ?? null });
  await sql`
    UPDATE deployments
    SET status = ${status}, url = COALESCE(${url ?? null}, url)
    WHERE id = ${id};
  `;
}

function runCommand(command, args, options, onChunk) {
  return new Promise((resolve, reject) => {
    console.log(`${LOG_PREFIX} run command`, {
      command,
      args: args.map((arg) => (arg === process.env.VERCEL_TOKEN ? "***" : arg))
    });
    const child = spawn(command, args, options);
    child.stdout.on("data", (data) => onChunk(String(data)));
    child.stderr.on("data", (data) => onChunk(String(data)));
    child.on("close", (code) => {
      console.log(`${LOG_PREFIX} command finished`, { command, code });
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

function stripProtocol(value) {
  if (!value) return value;
  return String(value).replace(/^https?:\/\//, "").replace(/\/$/, "");
}

async function handleJob(job) {
  console.log(`${LOG_PREFIX} handling job`, {
    id: job.id,
    repo: `${job.owner}/${job.repo}`,
    branch: job.branch
  });
  await heartbeat("busy");
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
      console.log(`${LOG_PREFIX} detected deployment url`, { id: job.id, url: latestUrl });
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
    console.log(`${LOG_PREFIX} cloning repo`, { id: job.id, repoUrl });
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
    console.log(`${LOG_PREFIX} preparing env vars`, { id: job.id, count: Object.keys(envVars).length });
    for (const [key, value] of Object.entries(envVars)) {
      envArgs.push("-e", `${key}=${value}`);
      envArgs.push("-b", `${key}=${value}`);
    }

    const scope = process.env.VERCEL_TEAM_ID ?? process.env.VERCEL_ORG_ID ?? "";
    const scopeArgs = scope ? ["--scope", scope] : [];
    if (scope) {
      console.log(`${LOG_PREFIX} using vercel scope`, { scope });
    }

    queueLog("Starting Vercel deployment\n");
    await runCommand(
      "vercel",
      [
        "deploy",
        "--prod",
        "--yes",
        "--public",
        "--token",
        process.env.VERCEL_TOKEN ?? "",
        "--name",
        job.project_name ?? `deploy-${job.owner}-${job.repo}`,
        ...scopeArgs,
        ...envArgs
      ],
      { cwd: tempDir, stdio: "pipe", env: { ...process.env, CI: "1" } },
      queueLog
    );

    await flushLogs();
    const finalUrl = latestUrl;
    if (!finalUrl) {
      console.log(`${LOG_PREFIX} missing deployment url`, { id: job.id });
      throw new Error("Deployment completed but no URL was detected.");
    }

    const normalizedUrl = stripProtocol(finalUrl);
    console.log(`${LOG_PREFIX} deployment ready`, { id: job.id, url: normalizedUrl });
    await setJobStatus(job.id, "READY", { url: normalizedUrl });
    await updateDeploymentRecord(job.id, "READY", normalizedUrl);
  } catch (error) {
    await flushLogs();
    const message = error instanceof Error ? error.message : "Deployment failed";
    console.error(`${LOG_PREFIX} job failed`, { id: job.id, message });
    await setJobStatus(job.id, "ERROR", { error: message });
    await updateDeploymentRecord(job.id, "ERROR");
  } finally {
    if (flushTimer) {
      clearTimeout(flushTimer);
    }
    await heartbeat("idle");
    console.log(`${LOG_PREFIX} cleaning temp dir`, { id: job.id, tempDir });
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  if (!process.env.VERCEL_TOKEN) {
    throw new Error("Missing VERCEL_TOKEN for worker.");
  }

  console.log(`${LOG_PREFIX} starting worker`, { pollMs: POLL_INTERVAL_MS });
  await ensureJobsTable();
  await ensureWorkerTable();

  while (true) {
    await heartbeat("idle");
    const job = await claimNextJob();
    if (job) {
      console.log(`${LOG_PREFIX} processing job`, { id: job.id });
      await handleJob(job);
      console.log(`${LOG_PREFIX} job complete`, { id: job.id });
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

main().catch((error) => {
  console.error("Worker failed", error);
  process.exit(1);
});
