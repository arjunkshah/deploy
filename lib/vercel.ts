const VERCEL_API = "https://api.vercel.com";

export class VercelApiError extends Error {
  status: number;
  code?: string;
  action?: string;
  link?: string;
  repo?: string;

  constructor(message: string, status: number, options?: { code?: string; action?: string; link?: string; repo?: string }) {
    super(message);
    this.name = "VercelApiError";
    this.status = status;
    this.code = options?.code;
    this.action = options?.action;
    this.link = options?.link;
    this.repo = options?.repo;
  }
}

function getHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Missing VERCEL_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "deploydotcom"
  };
}

function getAuthHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Missing VERCEL_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "User-Agent": "deploydotcom"
  };
}

async function vercelRequest<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${VERCEL_API}${path}`, { ...init, headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    const detail = await res.text();
    try {
      const parsed = JSON.parse(detail);
      const error = parsed?.error ?? {};
      const message = error.message ?? `Vercel request failed: ${res.status} ${res.statusText}`;
      throw new VercelApiError(message, res.status, {
        code: error.code,
        action: error.action,
        link: error.link,
        repo: error.repo
      });
    } catch {
      throw new VercelApiError(`Vercel request failed: ${res.status} ${res.statusText} ${detail}`, res.status);
    }
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json() as Promise<T>;
}

export interface EnvVarInput {
  key: string;
  value: string;
  target?: ("production" | "preview" | "development")[];
}

export interface CreateProjectInput {
  name: string;
  gitRepository?: { type: "github"; repo: string };
  framework?: string | null;
  buildCommand?: string | null;
  outputDirectory?: string | null;
}

export async function createProject(input: CreateProjectInput): Promise<{ id: string; name: string }> {
  const payload: Record<string, unknown> = {
    name: input.name
  };

  if (input.gitRepository) payload.gitRepository = input.gitRepository;

  if (input.framework !== undefined) payload.framework = input.framework;
  if (input.buildCommand !== undefined) payload.buildCommand = input.buildCommand;
  if (input.outputDirectory !== undefined) payload.outputDirectory = input.outputDirectory;

  return vercelRequest("/v10/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function setEnvVars(projectId: string, envVars: EnvVarInput[]) {
  const payloads = envVars.map((env) => ({
    key: env.key,
    value: env.value,
    type: "encrypted",
    target: env.target ?? ["production", "preview"]
  }));

  for (const env of payloads) {
    await vercelRequest(`/v10/projects/${projectId}/env`, {
      method: "POST",
      body: JSON.stringify(env)
    });
  }
}

export async function triggerDeploy(input: {
  projectId: string;
  ref: string;
  repoId: number;
}): Promise<{ id: string; url: string }> {
  return vercelRequest("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      name: input.projectId,
      project: input.projectId,
      target: "production",
      gitSource: {
        type: "github",
        repoId: input.repoId,
        ref: input.ref
      }
    })
  });
}

export interface InlineFileInput {
  file: string;
  data: string;
  encoding: "base64";
}

export async function createDeploymentFromFiles(input: {
  name: string;
  projectId: string;
  files: (InlineFileInput | { file: string; sha: string; size: number; mode?: number })[];
  target?: "production" | "preview";
  projectSettings?: {
    framework?: string | null;
    buildCommand?: string | null;
    outputDirectory?: string | null;
    rootDirectory?: string | null;
    skipGitConnectDuringLink?: boolean;
  };
}): Promise<{ id: string; url: string }> {
  const payload: Record<string, unknown> = {
    name: input.name,
    project: input.projectId,
    target: input.target ?? "production",
    files: input.files,
    projectSettings: {
      framework: null,
      skipGitConnectDuringLink: true,
      ...(input.projectSettings ?? {})
    }
  };

  return vercelRequest("/v13/deployments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function uploadDeploymentFile(sha: string, data: Buffer) {
  const res = await fetch(`${VERCEL_API}/v2/files`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/octet-stream",
      "Content-Length": `${data.length}`,
      "x-now-digest": sha,
      "x-now-size": `${data.length}`
    },
    body: data as unknown as BodyInit
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new VercelApiError(`Vercel file upload failed: ${res.status} ${res.statusText} ${detail}`, res.status);
  }
}

export interface DeploymentStatusPayload {
  readyState: "QUEUED" | "BUILDING" | "READY" | "ERROR" | "CANCELED";
  url: string;
}

export async function getDeploymentStatus(id: string): Promise<DeploymentStatusPayload> {
  return vercelRequest(`/v6/deployments/${id}`, { method: "GET" });
}

export interface DeploymentEvent {
  type: string;
  payload?: { text?: string };
  created: number;
}

export async function getDeploymentEvents(id: string): Promise<DeploymentEvent[]> {
  try {
    const res = await vercelRequest<{ events: DeploymentEvent[] }>(`/v13/deployments/${id}/events`, { method: "GET" });
    return res.events ?? [];
  } catch {
    return [];
  }
}

export async function deleteProject(id: string) {
  await vercelRequest(`/v9/projects/${id}`, { method: "DELETE" });
}
