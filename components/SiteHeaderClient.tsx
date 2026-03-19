"use client";

import Link from "next/link";

import { HeaderAuth } from "@/components/HeaderAuth";

export function SiteHeaderClient({
  active,
  authenticated,
  email
}: {
  active?: "dashboard";
  authenticated: boolean;
  email?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          deploy<span className="text-primary">.com</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/#product" className="transition-colors hover:text-foreground">
            Product
          </Link>
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#security" className="transition-colors hover:text-foreground">
            Security
          </Link>
        </nav>
        <nav className="flex items-center gap-3 text-sm">
          <HeaderAuth authenticated={authenticated} email={email} active={active} />
          <Link
            href="/#product"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            Start deploy
          </Link>
        </nav>
      </div>
    </header>
  );
}
