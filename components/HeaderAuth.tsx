"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function HeaderAuth({
  authenticated,
  email,
  active
}: {
  authenticated: boolean;
  email?: string | null;
  active?: "dashboard";
}) {
  if (!authenticated) {
    return (
      <>
        <Link
          href="/login"
          className={`text-sm transition-colors hover:text-foreground ${active === "dashboard" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          Create account
        </Link>
      </>
    );
  }

  const label = email ?? "Account";
  const initial = label.trim()[0]?.toUpperCase() ?? "A";

  return (
    <>
      <Link
        href="/dashboard"
        className={`text-sm transition-colors hover:text-foreground ${active === "dashboard" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Dashboard
      </Link>
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initial}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign out
      </button>
    </>
  );
}
