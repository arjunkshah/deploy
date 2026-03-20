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
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute right-[-120px] top-32 h-96 w-96 rounded-full bg-foreground/5 blur-[180px]" />
        <div className="absolute bottom-[-220px] left-[30%] h-80 w-80 rounded-full bg-primary/10 blur-[200px]" />
      </div>

      <motion.section
        id="product"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <DotFilledIcon className="h-3 w-3 text-primary" />
            URL-first deploys
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Deploy any public Git repo in two clicks.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              Replace the domain, add env vars, and keep the entire build flow visible in one place. Deploy.com handles
              repo validation, queuing, and the final URL while your team watches the status together.
            </p>
          </div>
          <HeroUrlSwap primary="github.com" secondary="deploydotcom.vercel.app" suffix="/arjunkshah/pincer" />
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <QuickDeployForm />
            <div className="rounded-2xl border border-border/70 bg-card p-4 text-xs text-muted-foreground">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">What ships</p>
              <div className="mt-4 space-y-3">
                {[
                  "Live status URL",
                  "Per-branch deploy history",
                  "Env var snapshots",
                  "Auto cleanup in 7 days"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckIcon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              href="/docs"
              className="rounded-full border border-border/80 bg-card px-5 py-3 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 active:scale-[0.98]"
            >
              Read the docs
            </Link>
          </div>
        </div>

        <motion.div layout className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Live deployment</span>
              <motion.span
                className="flex items-center gap-2"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Deploying
              </motion.span>
            </div>
            <div className="mt-5 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>QUEUED</span>
                <span className="text-foreground">00:12</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CLONING</span>
                <span className="text-foreground">00:22</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DEPLOYING</span>
                <span className="text-foreground">01:18</span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span>READY</span>
                <span>01:52</span>
              </div>
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
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Recent deploy</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Repo</span>
                <span className="font-mono text-foreground">arjunkshah/pincer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-mono text-foreground">main</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-foreground">Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <section id="docs" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Every deploy stays observable.</h2>
            <p className="text-base text-muted-foreground">
              Status timelines, environment snapshots, and shareable URLs live side by side. Track the handoff from
              queue to ready without switching tools.
            </p>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Read the full docs
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Status timeline</div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Queue accepted · 00:12",
                  "Clone finished · 00:34",
                  "Build completed · 01:41"
                ].map((line) => (
                  <div key={line} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-foreground">{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Domains</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a vanity domain when the build completes, or point a subdomain to any deployment.
              </p>
              <div className="mt-4 rounded-full border border-border/70 bg-background px-3 py-1 font-mono text-xs text-foreground">
                deploy.acme.dev
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Plans</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Start free, scale when you need it.</h2>
            <p className="text-base text-muted-foreground">
              Keep hobby repos free and add team controls for longer retention, domain routing, and priority builds.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <p className="text-sm font-semibold text-foreground">Core</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">$0</p>
              <p className="mt-2 text-sm text-muted-foreground">Public repos, live logs, and 7-day cleanup.</p>
              <MagneticButton className="mt-6 w-full rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]">
                Start free
              </MagneticButton>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <p className="text-sm font-semibold text-foreground">Teams</p>
              <p className="mt-4 text-3xl font-semibold text-foreground">$29</p>
              <p className="mt-2 text-sm text-muted-foreground">Custom domains, longer retention, and priority builds.</p>
              <button className="mt-6 w-full rounded-full border border-border/80 bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-foreground/40 active:scale-[0.98]">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 rounded-2xl border border-border/70 bg-card p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Security</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Auth-gated deployments, by default.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Require Google or email/password before a deploy is queued. Every deployment is tied to a user session.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              { label: "Auth methods", value: "Google + email" },
              { label: "Audit log retention", value: "30 days" },
              { label: "Deployment history", value: "Per user" }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
