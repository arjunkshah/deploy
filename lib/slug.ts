export function parseSlug(slug: string): { owner: string; repo: string } | null {
  const decoded = decodeURIComponent(slug);
  if (!decoded.includes("/")) return null;
  const [owner, repo] = decoded.split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
}

export function buildSlug(owner: string, repo: string) {
  return encodeURIComponent(`${owner}/${repo}`);
}
