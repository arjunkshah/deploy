import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl space-y-6 rounded-3xl border border-border/70 bg-card p-8 text-center shadow-[0_30px_60px_-55px_rgba(15,23,42,0.45)]">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Repo not found</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Public repositories only.</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find that repository or it is private. Deploy.com currently supports public repositories only.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
