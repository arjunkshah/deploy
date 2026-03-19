const GITHUB_API = "https://api.github.com";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "deploydotcom"
  };
}

async function githubRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub request failed: ${res.status} ${res.statusText} ${detail}`);
  }
  return res.json() as Promise<T>;
}

export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  owner: { login: string; avatar_url: string };
  stargazers_count: number;
  language: string | null;
  description: string | null;
  size: number;
}

export async function getRepo(owner: string, repo: string): Promise<RepoInfo> {
  const data = await githubRequest<RepoInfo>(`/repos/${owner}/${repo}`);
  if (data.private) {
    throw new Error("Repository is private. Only public repositories are supported.");
  }
  return data;
}

export async function downloadRepoArchive(owner: string, repo: string, ref: string): Promise<Buffer> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/tarball/${encodeURIComponent(ref)}`, {
    headers: getHeaders(),
    redirect: "follow",
    cache: "no-store"
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub archive fetch failed: ${res.status} ${res.statusText} ${detail}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getReadmeSnippet(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await githubRequest<{ content: string; encoding: string }>(`/repos/${owner}/${repo}/readme`);
    if (res.encoding === "base64") {
      const decoded = Buffer.from(res.content, "base64").toString("utf-8");
      return decoded.slice(0, 400);
    }
    return null;
  } catch {
    return null;
  }
}
