export interface EnvVarPair {
  key: string;
  value: string;
}

export function parseEnvQuery(env?: string | null): EnvVarPair[] {
  if (!env) return [];
  return env
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [key, ...rest] = pair.split("=");
      return { key: key?.trim() ?? "", value: rest.join("=").trim() };
    })
    .filter((item) => item.key.length > 0 && item.value.length > 0);
}

export function normalizeEnvVars(vars: EnvVarPair[]): EnvVarPair[] {
  const seen = new Set<string>();
  return vars.filter((env) => {
    const key = env.key.trim();
    if (!key || !env.value.trim()) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
