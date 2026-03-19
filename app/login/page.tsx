import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { SiteHeader } from "@/components/SiteHeader";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const returnTo = typeof params.returnTo === "string" ? params.returnTo : undefined;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const session = await getAuthSession();
  if (session) {
    redirect((returnTo ?? "/dashboard") as Route);
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Deploy.com access</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">Sign in to launch deployments.</h1>
            <p className="mt-4 text-base text-muted-foreground">
              Keep deployments organized, shareable, and tied to a single dashboard.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground shadow-[0_20px_50px_-40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between">
              <span>Instant deploys</span>
              <span className="font-mono text-foreground">1m 52s avg</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <span>Status URLs</span>
              <span className="font-mono text-foreground">live logs</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <span>Custom domains</span>
              <span className="font-mono text-foreground">optional</span>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-border/70 bg-card p-8 shadow-[0_30px_60px_-55px_rgba(15,23,42,0.25)]">
          <GoogleAuthButton returnTo={returnTo} disabled={!googleEnabled} />
          {!googleEnabled && (
            <p className="mt-2 text-xs text-muted-foreground">Google auth isn&apos;t configured yet.</p>
          )}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border/70" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/70" />
          </div>
          <AuthForm mode="login" returnTo={returnTo} />
          <p className="mt-4 text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/signup" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
