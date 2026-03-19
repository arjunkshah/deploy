import { sql } from "@vercel/postgres";

export type DeploymentStatus = "QUEUED" | "BUILDING" | "READY" | "ERROR";

export interface DeploymentRecord {
  id: string;
  projectId: string;
  repo: string;
  branch: string;
  envVars: Record<string, string>;
  url: string | null;
  status: DeploymentStatus;
  userEmail?: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface DomainRecord {
  id: string;
  repo: string;
  domain: string;
  createdAt: Date;
}

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  repo TEXT,
  branch TEXT,
  env_vars JSONB,
  url TEXT,
  status TEXT,
  user_email TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
expires_at TIMESTAMP WITH TIME ZONE
);`;

const CREATE_DOMAINS_TABLE = `
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  repo TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (repo, domain)
);`;

const toDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (!value) return new Date();
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const normalizeStatus = (value: unknown): DeploymentStatus => {
  const normalized = String(value ?? "ERROR").toUpperCase();
  if (normalized === "QUEUED" || normalized === "BUILDING" || normalized === "READY") {
    return normalized;
  }
  return "ERROR";
};

export async function ensureDeploymentTable() {
  await sql.query(CREATE_TABLE);
  await sql`ALTER TABLE deployments ADD COLUMN IF NOT EXISTS user_email TEXT;`;
}

export async function ensureDomainsTable() {
  await sql.query(CREATE_DOMAINS_TABLE);
}

export async function insertDeployment(record: {
  id: string;
  projectId: string;
  repo: string;
  branch: string;
  envVars: Record<string, string>;
  url: string | null;
  status: DeploymentStatus;
  userEmail?: string | null;
  expiresAt?: Date;
}) {
  await ensureDeploymentTable();
  const expiresAt = record.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO deployments (id, project_id, repo, branch, env_vars, url, status, user_email, expires_at)
    VALUES (${record.id}, ${record.projectId}, ${record.repo}, ${record.branch}, ${JSON.stringify(record.envVars)}, ${record.url}, ${record.status}, ${record.userEmail ?? null}, ${expiresAt.toISOString()})
    ON CONFLICT (id) DO UPDATE SET
      project_id = EXCLUDED.project_id,
      repo = EXCLUDED.repo,
      branch = EXCLUDED.branch,
      env_vars = EXCLUDED.env_vars,
      url = EXCLUDED.url,
      status = EXCLUDED.status,
      user_email = COALESCE(EXCLUDED.user_email, deployments.user_email),
      expires_at = EXCLUDED.expires_at;
  `;
}

export async function updateDeploymentStatus(id: string, status: DeploymentStatus, url?: string | null) {
  await ensureDeploymentTable();
  await sql`
    UPDATE deployments
    SET status = ${status}, url = COALESCE(${url}, url)
    WHERE id = ${id};
  `;
}

export async function getDeployment(id: string): Promise<DeploymentRecord | null> {
  await ensureDeploymentTable();
  const { rows } = await sql`
    SELECT id, project_id, repo, branch, env_vars, url, status, user_email, created_at, expires_at
    FROM deployments
    WHERE id = ${id}
    LIMIT 1;
  `;
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    projectId: row.project_id,
    repo: row.repo,
    branch: row.branch,
    envVars: row.env_vars ?? {},
    url: row.url,
    status: normalizeStatus(row.status),
    userEmail: row.user_email ?? null,
    createdAt: toDate(row.created_at),
    expiresAt: toDate(row.expires_at)
  };
}

export async function listRecentDeployments(limit = 5, userEmail?: string | null): Promise<DeploymentRecord[]> {
  await ensureDeploymentTable();
  let rows: any[] = [];
  if (userEmail) {
    const result = await sql`
      SELECT id, project_id, repo, branch, env_vars, url, status, user_email, created_at, expires_at
      FROM deployments
      WHERE user_email = ${userEmail}
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    rows = result.rows as any[];
  }
  if (rows.length === 0) {
    const result = await sql`
      SELECT id, project_id, repo, branch, env_vars, url, status, user_email, created_at, expires_at
      FROM deployments
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    rows = result.rows as any[];
  }
  return rows.map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    repo: String(row.repo),
    branch: String(row.branch),
    envVars: row.env_vars ?? {},
    url: row.url ?? null,
    status: normalizeStatus(row.status),
    userEmail: row.user_email ?? null,
    createdAt: toDate(row.created_at),
    expiresAt: toDate(row.expires_at)
  }));
}

export async function getExpiredDeployments(): Promise<DeploymentRecord[]> {
  await ensureDeploymentTable();
  const { rows } = await sql`
    SELECT id, project_id, repo, branch, env_vars, url, status, user_email, created_at, expires_at
    FROM deployments
    WHERE expires_at < NOW();
  `;
  return rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    repo: row.repo,
    branch: row.branch,
    envVars: row.env_vars ?? {},
    url: row.url,
    status: normalizeStatus(row.status),
    userEmail: row.user_email ?? null,
    createdAt: toDate(row.created_at),
    expiresAt: toDate(row.expires_at)
  }));
}

export async function purgeExpired() {
  await ensureDeploymentTable();
  await sql`DELETE FROM deployments WHERE expires_at < NOW();`;
}

export async function listDomains(repo: string): Promise<DomainRecord[]> {
  await ensureDomainsTable();
  const { rows } = await sql`
    SELECT id, repo, domain, created_at
    FROM domains
    WHERE repo = ${repo}
    ORDER BY created_at DESC;
  `;
  return rows.map((row) => ({
    id: row.id,
    repo: row.repo,
    domain: row.domain,
    createdAt: toDate(row.created_at)
  }));
}

export async function addDomain(record: { id: string; repo: string; domain: string }) {
  await ensureDomainsTable();
  await sql`
    INSERT INTO domains (id, repo, domain)
    VALUES (${record.id}, ${record.repo}, ${record.domain})
    ON CONFLICT (repo, domain) DO NOTHING;
  `;
}

export async function removeDomain(record: { repo: string; domain: string }) {
  await ensureDomainsTable();
  await sql`
    DELETE FROM domains
    WHERE repo = ${record.repo} AND domain = ${record.domain};
  `;
}
