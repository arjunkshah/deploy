"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { HeroUrlSwap } from "@/components/HeroUrlSwap";
import { MagneticButton } from "@/components/MagneticButton";
import { QuickDeployForm } from "@/components/QuickDeployForm";
import { ArrowRightIcon, CheckIcon, DotFilledIcon } from "@radix-ui/react-icons";

export function HomeHero() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-140px] top-24 h-80 w-80 rounded-full bg-foreground/5 blur-[170px]" />
      </div>

      <motion.section
        id="product"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <DotFilledIcon className="h-3 w-3 text-primary" />
            Deploy from URL
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Deploy any Git repo in 2 clicks.
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Deploy.com turns a public GitHub URL into a production-ready site in minutes. Add env vars, pick a branch,
            and share the live status while the build runs.
          </p>
          <HeroUrlSwap primary="github.com" secondary="deploydotcom.vercel.app" suffix="/arjunkshah/pincer" />
          <QuickDeployForm className="mt-4" />
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            {[
              "Vercel builds",
              "Preview URLs",
              "Auth gated",
              "Cleanup automation"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckIcon className="h-3.5 w-3.5 text-primary" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <MagneticButton
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                Start deploying
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </MagneticButton>
            <Link
              href="/dashboard"
              className="rounded-full border border-border/80 bg-card px-5 py-3 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 active:scale-[0.98]"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <motion.div
          layout
          className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.18)]"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Live deployment</span>
            <motion.span
              className="flex items-center gap-2"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Building
            </motion.span>
          </div>
          <div className="mt-5 rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs text-muted-foreground">
            <div>Cloning arjunkshah/pincer</div>
            <div>Installing dependencies</div>
            <div>Running build</div>
            <div className="text-foreground">Deployment ready</div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Live URL</div>
              <div className="rounded-full border border-border/70 bg-background px-3 py-1 font-mono text-xs text-foreground">
                deploydotcom.vercel.app/pincer
              </div>
              <div className="text-[11px] text-muted-foreground">Share or scan for the preview.</div>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-2">
              <QRCodeSVG
                value="https://deploydotcom.vercel.app/arjunkshah/pincer"
                size={90}
                bgColor="transparent"
                fgColor="#0f172a"
                level="M"
              />
            </div>
          </div>
        </motion.div>
      </motion.section>

      <section id="docs" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Every deploy ships with context.</h2>
            <p className="text-base text-muted-foreground">
              Status URLs, build logs, and custom domains stay tied to each deployment. Share the link and stay aligned.
            </p>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Read the full docs
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <div className="mt-6 space-y-3 rounded-2xl border border-border/70 bg-card p-5">
              {[
                { title: "Parse the repo", desc: "Owner, branch, and env vars are detected from the URL." },
                { title: "Provision on Vercel", desc: "Projects are created with clean defaults." },
                { title: "Track in real time", desc: "Logs and status update every few seconds." }
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Live logs</div>
              <div className="mt-4 space-y-2 font-mono text-xs text-muted-foreground">
                <div>Installing dependencies…</div>
                <div>Running build command…</div>
                <div className="text-foreground">Ready in 1m 52s</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Domains</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Attach vanity domains or point a subdomain at any deployment.
              </p>
              <div className="mt-4 rounded-full border border-border/70 bg-background px-3 py-1 font-mono text-xs text-foreground">
                deploy.acme.dev
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Ship confidently at any scale.</h2>
            <p className="text-base text-muted-foreground">
              Start free and upgrade when you need custom domains, audit logs, and longer retention.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Core</p>
                <p className="text-3xl font-semibold text-foreground">$0</p>
                <p className="text-sm text-muted-foreground">Public repos, live logs, and 7-day cleanup.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Teams</p>
                <p className="text-3xl font-semibold text-foreground">$29</p>
                <p className="text-sm text-muted-foreground">Custom domains, longer retention, and priority builds.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <MagneticButton className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]">
                Start free
              </MagneticButton>
              <button className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 active:scale-[0.98]">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl border border-border/70 bg-card p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Security</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Auth-gated deployments, by default.
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Require Google or email/password before a deploy is queued. Every deployment is tied to a user session.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm">
                <span className="text-muted-foreground">Auth methods</span>
                <span className="font-medium text-foreground">Google + email</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm">
                <span className="text-muted-foreground">Audit log retention</span>
                <span className="font-medium text-foreground">30 days</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm">
                <span className="text-muted-foreground">Deployment history</span>
                <span className="font-medium text-foreground">Per user</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
