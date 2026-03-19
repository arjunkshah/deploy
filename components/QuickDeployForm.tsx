"use client";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/MagneticButton";

function parseRepo(input: string) {
  const trimmed = input.trim();
  const fullMatch = trimmed.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/i);
  if (fullMatch) {
    return { owner: fullMatch[1], repo: fullMatch[2] };
  }
  const simpleMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] };
  }
  return null;
}

export function QuickDeployForm({ className }: { className?: string }) {
  const [input, setInput] = useState("github.com/arjunkshah/pincer");
  const router = useRouter();

  const parsed = useMemo(() => parseRepo(input), [input]);
  const target = parsed ? `/${parsed.owner}/${parsed.repo}` : null;

  const handleSubmit = () => {
    if (!target) return;
    router.push(target as Route);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Try it now</div>
      <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-full border border-border/80 bg-card px-4 py-2.5 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.25)]">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full bg-transparent font-mono text-sm text-muted-foreground outline-none transition-colors focus:text-foreground"
          placeholder="github.com/user/repo"
        />
        <MagneticButton
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
        >
          Deploy
        </MagneticButton>
      </div>
      <p className="text-xs text-muted-foreground">Replace the domain in any GitHub URL to open a deploy page.</p>
    </div>
  );
}
