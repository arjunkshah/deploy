"use client";

import { useState } from "react";

interface DomainsManagerProps {
  repo: string;
  initialDomains: { id: string; domain: string }[];
}

export function DomainsManager({ repo, initialDomains }: DomainsManagerProps) {
  const [domains, setDomains] = useState(initialDomains);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, domain: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to add domain");
      setDomains((prev) => [{ id: data.id, domain: data.domain }, ...prev]);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add domain");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (domain: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, domain })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to remove domain");
      setDomains((prev) => prev.filter((item) => item.domain !== domain));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove domain");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (domain: string) => {
    try {
      await navigator.clipboard.writeText(domain);
      setCopied(domain);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex max-w-md gap-4">
        <input
          type="text"
          placeholder="yourdomain.com"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded-md border border-border/80 bg-card px-3 py-2 font-mono text-sm outline-none transition-colors focus:border-foreground/50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="rounded-full border border-border/80 bg-card px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground/40 disabled:opacity-60"
        >
          Add
        </button>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="space-y-3">
        {domains.length === 0 && <p className="text-sm text-muted-foreground">No custom domains yet.</p>}
        {domains.map((domain) => (
          <div key={domain.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3">
            <div className="font-mono text-sm text-foreground">{domain.domain}</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCopy(domain.domain)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                disabled={loading}
              >
                {copied === domain.domain ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(domain.domain)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-rose-600"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
