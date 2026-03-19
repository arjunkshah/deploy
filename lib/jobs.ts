import { sql } from "@vercel/postgres";

export type JobStatus = "QUEUED" | "CLONING" | "DEPLOYING" | "READY" | "ERROR";

export interface DeployJob {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  envVars: Record<string, string>;
  status: JobStatus;
  projectName: string;
  url?: string | null;
  logs?: string | null;
  error?: string | null;
  userEmail?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

const toDate = (value: unknown) => (value instanceof Date ? value : new Date(value as string));

const normalizeStatus = (value: unknown): JobStatus => {
  const normalized = String(value ?? "QUEUED").toUpperCase();
  if (normalized === "CLONING" || normalized === "DEPLOYING" || normalized === "READY" || normalized === "ERROR") {
    return normalized as JobStatus;
  }
  return "QUEUED";
};

async function ensureJobsTable() {
  console.log("[jobs] ensuring deploy_jobs table");
  await sql.query(CREATE_JOBS_TABLE);
}

export async function createJob(record: {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  envVars: Record<string, string>;
  projectName: string;
  userEmail?: string | null;
}) {
  await ensureJobsTable();
  console.log("[jobs] creating job", {
    id: record.id,
    repo: `${record.owner}/${record.repo}`,
    branch: record.branch,
    envCount: Object.keys(record.envVars ?? {}).length
  });
  await sql`
    INSERT INTO deploy_jobs (id, owner, repo, branch, env_vars, status, project_name, user_email)
    VALUES (
      ${record.id},
      ${record.owner},
      ${record.repo},
      ${record.branch},
      ${JSON.stringify(record.envVars)},
      'QUEUED',
      ${record.projectName},
      ${record.userEmail ?? null}
    );
  `;
}

export async function getJob(id: string): Promise<DeployJob | null> {
  await ensureJobsTable();
  console.log("[jobs] fetching job", { id });
  const { rows } = await sql`
    SELECT id, owner, repo, branch, env_vars, status, project_name, url, logs, error, user_email, created_at, updated_at
    FROM deploy_jobs
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    owner: row.owner,
    repo: row.repo,
    branch: row.branch,
    envVars: row.env_vars ?? {},
    status: normalizeStatus(row.status),
    projectName: row.project_name ?? "",
    url: row.url ?? null,
    logs: row.logs ?? null,
    error: row.error ?? null,
    userEmail: row.user_email ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at)
  };
}

export async function claimNextJob(): Promise<DeployJob | null> {
  await ensureJobsTable();
  console.log("[jobs] claiming next job");
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
    RETURNING id, owner, repo, branch, env_vars, status, project_name, url, logs, error, user_email, created_at, updated_at;
  `;
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    owner: row.owner,
    repo: row.repo,
    branch: row.branch,
    envVars: row.env_vars ?? {},
    status: normalizeStatus(row.status),
    projectName: row.project_name ?? "",
    url: row.url ?? null,
    logs: row.logs ?? null,
    error: row.error ?? null,
    userEmail: row.user_email ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at)
  };
}

export async function appendJobLog(id: string, chunk: string) {
  await ensureJobsTable();
  const trimmed = chunk.replace(/\u0000/g, "");
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

export async function setJobStatus(id: string, status: JobStatus, options?: { url?: string | null; error?: string | null }) {
  await ensureJobsTable();
  console.log("[jobs] setting status", { id, status });
  await sql`
    UPDATE deploy_jobs
    SET status = ${status},
        url = COALESCE(${options?.url ?? null}, url),
        error = COALESCE(${options?.error ?? null}, error),
        updated_at = NOW()
    WHERE id = ${id};
  `;
}
